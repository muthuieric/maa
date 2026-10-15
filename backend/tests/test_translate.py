"""
Tests for the English -> Maasai translation endpoints.

These tests deliberately do NOT download or load the ~3.5 GB model. They verify:
  1. The routes are registered and reachable.
  2. The status endpoint reports availability honestly.
  3. When torch/transformers/peft are absent (as in CI), translation returns a
     clear 503 rather than crashing the app.
  4. When the model stack IS present, translation is monkeypatched to a fake so
     the endpoint contract (fields, licence notice) is validated cheaply.
  5. A real end-to-end translation runs only when weights are cached locally and
     RUN_MODEL_TESTS=1 is set.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.nlp import translator as translator_module  # noqa: E402

client = TestClient(app)


def _model_stack_installed() -> bool:
    try:
        import torch  # noqa: F401
        import transformers  # noqa: F401
        import peft  # noqa: F401
    except ImportError:
        return False
    return True


class _FakeTranslator:
    """Stand-in that mimics MaasaiTranslator without loading any weights."""

    _loaded = True

    def translate(self, text, max_new_tokens=None):
        return {
            "source_text": text,
            "translated_text": "[fake maasai output]",
            "source_language": "English",
            "target_language": "Maasai",
            "src_lang_code": "eng_Latn",
            "tgt_lang_code": "mas_Latn",
        }

    def translate_batch(self, texts):
        return [self.translate(t) for t in texts]


def test_translation_status_endpoint():
    """The status route must always answer 200 with a structured report."""
    response = client.get("/api/translate/status")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data
    assert "base_model" in data
    assert "adapter_model" in data
    # The adapter is English -> Maasai on the NLLB base model.
    assert data["base_model"] == "facebook/nllb-200-distilled-600M"
    assert data["adapter_model"].startswith("KnoxDevelopers/")


def test_health_includes_translation_block():
    """Health must expose translation capability without raising."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "translation" in data
    assert "available" in data["translation"]


def test_translate_graceful_when_model_stack_missing():
    """
    Without torch/transformers/peft the endpoint must return 503 with a helpful
    message instead of a 500, so the frontend can show an explanatory notice.
    """
    if _model_stack_installed():
        print("Model stack present; skipping missing-dependency 503 test.")
        return

    response = client.post("/api/translate", json={"text": "Female genital mutilation is harmful."})
    assert response.status_code == 503
    detail = response.json()["detail"].lower()
    assert "transformers" in detail or "torch" in detail


def test_translate_rejects_empty_text():
    """Empty text is rejected by request validation (422) before any model load."""
    response = client.post("/api/translate", json={"text": ""})
    assert response.status_code == 422


def test_translate_endpoint_contract_with_fake_model():
    """
    Validates the response contract using a fake translator, so the endpoint is
    covered even on machines where the real model cannot be loaded.
    """
    original = translator_module._translator_instance
    try:
        translator_module._translator_instance = _FakeTranslator()
        response = client.post(
            "/api/translate", json={"text": "The community rejects harmful practices."}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["translated_text"] == "[fake maasai output]"
        assert data["source_language"] == "English"
        assert data["target_language"] == "Maasai"
        # Non-commercial licence and human-review caveats must be surfaced.
        assert "cc-by-nc-4.0" in data["license"]
        assert data["review_recommended"] is True
    finally:
        translator_module._translator_instance = original


def test_batch_translation_contract_with_fake_model():
    original = translator_module._translator_instance
    try:
        translator_module._translator_instance = _FakeTranslator()
        response = client.post(
            "/api/translate/batch", json={"texts": ["One.", "Two."]}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["results"]) == 2
    finally:
        translator_module._translator_instance = original


def test_batch_translation_rejects_over_limit():
    """More than 20 texts per request is rejected to bound latency on CPU."""
    payload = {"texts": [f"Sentence number {i}." for i in range(21)]}
    response = client.post("/api/translate/batch", json=payload)
    assert response.status_code == 422


def test_real_translation_when_available():
    """
    Opt-in end-to-end test. Requires the model stack, locally cached weights and
    RUN_MODEL_TESTS=1. Skipped by default because it needs ~3.5 GB and is slow on CPU.
    """
    if os.getenv("RUN_MODEL_TESTS") != "1" or not _model_stack_installed():
        print("Skipping real translation test (set RUN_MODEL_TESTS=1 with weights cached).")
        return

    report = translator_module.check_availability()
    if not report.get("available"):
        print(f"Skipping real translation: {report.get('reason')}")
        return

    response = client.post(
        "/api/translate", json={"text": "We want to protect our daughters from harm."}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["translated_text"], str)
    assert data["translated_text"].strip() != ""
    print(f"Real translation output: {data['translated_text']!r}")


if __name__ == "__main__":
    test_translation_status_endpoint()
    test_health_includes_translation_block()
    test_translate_graceful_when_model_stack_missing()
    test_translate_rejects_empty_text()
    test_translate_endpoint_contract_with_fake_model()
    test_batch_translation_contract_with_fake_model()
    test_batch_translation_rejects_over_limit()
    test_real_translation_when_available()
    print("All translation tests passed!")
