from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from .config import settings
from .database import init_databases
from .routers import narratives, export, stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize hybrid SQL and NoSQL storage
    logger.info("Initializing NenoGuard Narrative Detection API...")
    init_databases()
    yield
    logger.info("Shutting down API services.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI backend for detecting harmful practice narratives in rural Kenya (Narok and Kajiado Counties).",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend.
# Origins are read from CORS_ORIGINS (comma-separated) in .env; defaults to the
# local dev origins. A wildcard is intentionally not used because
# allow_credentials=True would let any site make credentialed requests.
_CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import narratives, export, stats, ethics, lexicon_router

# Include API v1 Routers
app.include_router(narratives.router, prefix=settings.API_V1_STR)
app.include_router(export.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)
app.include_router(ethics.router, prefix=settings.API_V1_STR)
app.include_router(lexicon_router.router, prefix=settings.API_V1_STR)

from .schemas import NarrativeSubmission, SubmitResponse
from fastapi import Query

# Backward-compatibility routes matching original paper specification (Figure 3 and Figure 4)
@app.post("/submit", response_model=SubmitResponse, status_code=201, tags=["Paper Compatibility"])
async def submit_legacy(submission: NarrativeSubmission):
    return await narratives.submit_narrative(submission)

@app.get("/export", tags=["Paper Compatibility"])
async def export_legacy(format: str = Query("json", pattern="^(json|csv)$")):
    return await export.export_data(format)

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "bilingual_support": ["Swahili", "Maa"],
        "counties_targeted": ["Narok", "Kajiado"],
        "objectives": {
            "O1_bilingual_nlp": "Active (Transformer / Dialect Heuristics)",
            "O2_qualitative_validation": "Active (CBO Export & Annotation Matching)",
            "O3_ethical_model": "Active (Strict Consent Gated)"
        }
    }
