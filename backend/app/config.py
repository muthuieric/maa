import os
from pathlib import Path
from pydantic import BaseModel


def _load_dotenv(path: Path) -> None:
    """Minimal .env loader (no external dependency).

    Loads KEY=VALUE lines into os.environ without overriding variables that
    are already set. Only used for local development; production deployments
    should inject secrets via the environment / orchestrator secret store.
    """
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip("'\"")
        if key and key not in os.environ:
            os.environ[key] = value


# Repo-root .env (two levels up from backend/app/), if present.
_load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Settings(BaseModel):
    PROJECT_NAME: str = "NenoGuard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # PostgreSQL Configuration
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "narratives_meta")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "nenoguard_admin")
    # No default password: credentials come from the environment / .env file.
    # If unset, the PostgreSQL connection fails and storage falls back to SQLite.
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")

    
    # MongoDB Configuration
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/narratives_db")
    MONGO_DB: str = os.getenv("MONGO_DB", "narratives_db")
    
    # Local fallback storage paths (when live external DB servers are unavailable)
    SQLITE_PATH: str = os.getenv("SQLITE_PATH", "backend/narratives_meta.db")
    JSON_DOCS_PATH: str = os.getenv("JSON_DOCS_PATH", "backend/narratives_docs.json")
    
    # Ethical Consent Requirement
    ENFORCE_STRICT_CONSENT: bool = True

    # English -> Maasai Translation (NLLB + LoRA adapter)
    # The adapter is a PEFT LoRA on facebook/nllb-200-distilled-600M.
    # Nothing is downloaded or loaded at startup; see nlp/translator.py.
    TRANSLATOR_ENABLED: bool = os.getenv("TRANSLATOR_ENABLED", "true").lower() in (
        "1", "true", "yes", "on",
    )
    TRANSLATION_BASE_MODEL: str = os.getenv(
        "TRANSLATION_BASE_MODEL", "facebook/nllb-200-distilled-600M"
    )
    TRANSLATION_ADAPTER_MODEL: str = os.getenv(
        "TRANSLATION_ADAPTER_MODEL",
        "KnoxDevelopers/English-to-Maasai-language-translation-LoRA",
    )
    # Source/target language codes understood by the NLLB tokenizer.
    TRANSLATION_SRC_LANG: str = os.getenv("TRANSLATION_SRC_LANG", "eng_Latn")
    TRANSLATION_TGT_LANG: str = os.getenv("TRANSLATION_TGT_LANG", "mas_Latn")
    # float32 is safest for output quality; use bfloat16 to roughly halve RAM use
    # on CPU-only machines. float16 is NOT recommended on CPU (slow/unsupported).
    TRANSLATION_DTYPE: str = os.getenv("TRANSLATION_DTYPE", "float32")
    TRANSLATION_MAX_NEW_TOKENS: int = int(os.getenv("TRANSLATION_MAX_NEW_TOKENS", 128))
    # Local snapshot directory for the downloaded base model + adapter.
    TRANSLATION_CACHE_DIR: str = os.getenv("TRANSLATION_CACHE_DIR", "backend/models")

settings = Settings()

