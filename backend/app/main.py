from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

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

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
