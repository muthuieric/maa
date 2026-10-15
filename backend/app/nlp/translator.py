"""
English -> Maasai translation via NLLB-200 plus a community-trained LoRA adapter.

Model: facebook/nllb-200-distilled-600M base, with the PEFT LoRA adapter
KnoxDevelopers/English-to-Maasai-language-translation-LoRA (r=16, alpha=32).

Design notes
------------
- Lazy loading: nothing is downloaded or instantiated at import time or at app
  startup. The ~2.4 GB base model and the ~1.1 GB adapter are fetched on the
  first call to get_translator(). This keeps the API bootable on machines that
  have not provisioned the model (and on CI).
- CPU friendly: inference is synchronous and can take seconds on CPU, so callers
  must run it in a worker thread (see routers/translate.py) to avoid blocking
  the event loop.
- Availability reporting: check_availability() returns a structured report so the
  API can answer "why is translation unavailable?" without raising.
- Non-commercial license: the adapter is cc-by-nc-4.0.
"""

from __future__ import annotations

import logging
import os
import threading
from typing import Any, Dict, List, Optional

from ..config import settings

logger = logging.getLogger("nlp_translator")

# Lock guards lazy initialisation so concurrent requests do not load the model twice.
_load_lock = threading.Lock()
_translator_instance: Optional["MaasaiTranslator"] = None


class MaasaiTranslator:
    """Wraps an NLLB seq2seq model with the English->Maasai LoRA adapter applied."""

    def __init__(
        self,
        base_model: Optional[str] = None,
        adapter_model: Optional[str] = None,
        src_lang: Optional[str] = None,
        tgt_lang: Optional[str] = None,
        dtype: Optional[str] = None,
        max_new_tokens: Optional[int] = None,
        cache_dir: Optional[str] = None,
    ):
        self.base_model = base_model or settings.TRANSLATION_BASE_MODEL
        self.adapter_model = adapter_model or settings.TRANSLATION_ADAPTER_MODEL
        self.src_lang = src_lang or settings.TRANSLATION_SRC_LANG
        self.tgt_lang = tgt_lang or settings.TRANSLATION_TGT_LANG
        self.dtype = dtype or settings.TRANSLATION_DTYPE
        self.max_new_tokens = max_new_tokens or settings.TRANSLATION_MAX_NEW_TOKENS
        self.cache_dir = cache_dir or settings.TRANSLATION_CACHE_DIR

        self.tokenizer = None
        self.model = None
        self._loaded = False

    # ---------------------------------------------------------------- loading

    def _resolve_dtype(self):
        """Maps the configured dtype string to a torch dtype."""
        import torch

        mapping = {
            "float32": torch.float32,
            "fp32": torch.float32,
            "bfloat16": torch.bfloat16,
            "bf16": torch.bfloat16,
            "float16": torch.float16,
            "fp16": torch.float16,
        }
        return mapping.get(self.dtype.lower(), torch.float32)

    def load(self) -> "MaasaiTranslator":
        """Downloads (if needed) and loads base model + LoRA adapter.

        Raises ImportError when transformers/peft are not installed, so callers
        can distinguish a missing dependency from a corrupt download.
        """
        if self._loaded:
            return self

        try:
            import torch
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
            from peft import PeftModel
        except ImportError as exc:  # pragma: no cover - depends on host env
            raise ImportError(
                "English->Maasai translation requires 'transformers', 'peft' and "
                "'torch'. Install them with:  pip install -r backend/requirements.txt"
            ) from exc

        os.makedirs(self.cache_dir, exist_ok=True)
        logger.info("Loading NLLB base model '%s' ...", self.base_model)

        tokenizer = AutoTokenizer.from_pretrained(
            self.base_model,
            cache_dir=self.cache_dir,
            src_lang=self.src_lang,
            tgt_lang=self.tgt_lang,
        )

        model = AutoModelForSeq2SeqLM.from_pretrained(
            self.base_model,
            cache_dir=self.cache_dir,
            torch_dtype=self._resolve_dtype(),
            # Streams weights into RAM to avoid a second full copy on low-RAM hosts.
            low_cpu_mem_usage=True,
        )

        # Fix vocabulary size mismatch from KnoxDevelopers adapter training
        model.resize_token_embeddings(256205)

        logger.info("Applying LoRA adapter '%s' ...", self.adapter_model)
        model = PeftModel.from_pretrained(
            model, self.adapter_model, cache_dir=self.cache_dir
        )

        model.eval()
        # Restrict threads a little on small machines to avoid thrashing.
        if not torch.cuda.is_available():
            torch.set_num_threads(max(1, (os.cpu_count() or 4) // 2))

        self.tokenizer = tokenizer
        self.model = model
        self._loaded = True
        logger.info(
            "Translator ready (%s + adapter %s, dtype=%s)",
            self.base_model, self.adapter_model, self.dtype,
        )
        return self

    # ------------------------------------------------------------- inference

    def translate(self, text: str, max_new_tokens: Optional[int] = None) -> Dict[str, Any]:
        """Translates a single English string into Maasai.

        Returns the Maasai text plus the BCP-style language codes used, so the
        frontend can label the output unambiguously.
        """
        if not self._loaded:
            self.load()

        import torch

        text = (text or "").strip()
        if not text:
            raise ValueError("Text to translate must not be empty.")

        max_tokens = max_new_tokens or self.max_new_tokens
        tokenizer = self.tokenizer
        model = self.model

        # NLLB requires the source language token to be set on the tokenizer.
        tokenizer.src_lang = self.src_lang

        encoded = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=getattr(tokenizer, "model_max_length", 1024) or 1024,
        )

        # forced_bos_token_id is what actually makes NLLB generate the target language.
        forced_bos_token_id = tokenizer.convert_tokens_to_ids(self.tgt_lang)

        with torch.no_grad():
            generated = model.generate(
                **encoded,
                forced_bos_token_id=forced_bos_token_id,
                max_new_tokens=max_tokens,
                num_beams=4,
                no_repeat_ngram_size=3,
            )

        translation = tokenizer.batch_decode(generated, skip_special_tokens=True)[0]

        return {
            "source_text": text,
            "translated_text": translation.strip(),
            "source_language": "English",
            "target_language": "Maasai",
            "src_lang_code": self.src_lang,
            "tgt_lang_code": self.tgt_lang,
        }

    def translate_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Translates several English strings, one at a time.

        Batching is deliberately simple: sentences vary in length and the model
        is small, so per-item generation keeps memory predictable on CPU.
        """
        return [self.translate(t) for t in texts]


def check_availability() -> Dict[str, Any]:
    """Reports whether translation can run, and why not if it cannot.

    Does not download the model; it only checks dependencies and local snapshot
    presence so the API can respond quickly.
    """
    report: Dict[str, Any] = {
        "enabled": settings.TRANSLATOR_ENABLED,
        "base_model": settings.TRANSLATION_BASE_MODEL,
        "adapter_model": settings.TRANSLATION_ADAPTER_MODEL,
        "available": False,
        "reason": None,
        "missing_dependencies": [],
        "weights_present": False,
    }

    if not settings.TRANSLATOR_ENABLED:
        report["reason"] = "Translation disabled via TRANSLATOR_ENABLED=false."
        return report

    missing: List[str] = []
    for module_name in ("torch", "transformers", "peft", "safetensors"):
        try:
            __import__(module_name)
        except ImportError:
            missing.append(module_name)
    report["missing_dependencies"] = missing

    if missing:
        report["reason"] = (
            "Missing Python dependencies: "
            + ", ".join(missing)
            + ". Install with: pip install -r backend/requirements.txt"
        )
        return report

    # Look for a locally cached snapshot so we can say whether a download is pending.
    cache_dir = settings.TRANSLATION_CACHE_DIR
    try:
        entries = os.listdir(cache_dir)
    except OSError:
        entries = []

    weights_present = any(
        os.path.isdir(os.path.join(cache_dir, entry))
        and any(
            f.endswith(".safetensors")
            for f in os.listdir(os.path.join(cache_dir, entry))
        )
        for entry in entries
    )
    report["weights_present"] = weights_present

    if not weights_present:
        report["reason"] = (
            "Model weights not yet downloaded locally. The first translation "
            "request will fetch ~3.5 GB (NLLB base + LoRA adapter)."
        )
        return report

    report["available"] = True
    return report


def get_translator() -> MaasaiTranslator:
    """Returns the process-wide translator, loading it on first use."""
    global _translator_instance

    if _translator_instance is not None and _translator_instance._loaded:
        return _translator_instance

    with _load_lock:
        if _translator_instance is None:
            _translator_instance = MaasaiTranslator()
        if not _translator_instance._loaded:
            _translator_instance.load()
        return _translator_instance