import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "NenoGuard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # PostgreSQL Configuration
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "narratives_meta")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "nenoguard_admin")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "nenoguard_secure_pass_2026")
    
    # MongoDB Configuration
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/narratives_db")
    MONGO_DB: str = os.getenv("MONGO_DB", "narratives_db")
    
    # Local fallback storage paths (when live external DB servers are unavailable)
    SQLITE_PATH: str = os.getenv("SQLITE_PATH", "backend/narratives_meta.db")
    JSON_DOCS_PATH: str = os.getenv("JSON_DOCS_PATH", "backend/narratives_docs.json")
    
    # Ethical Consent Requirement
    ENFORCE_STRICT_CONSENT: bool = True

settings = Settings()

