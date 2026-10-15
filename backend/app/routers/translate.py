"""
English -> Maasai translation endpoints backed by NLLB-200 + LoRA adapter.

The model is heavy (~3.5 GB on first download) and CPU inference is synchronous,
so translation runs in a thread pool and the model is loaded lazily on first use.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

from starlette.concurrency import run_in_threadpool

from ..nlp.translator import check_availability, get_translator

router = APIRouter(prefix="/translate", tags=["English to Maasai Translation"])


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="English text to translate into Maasai")
    max_new_tokens: Optional[int] = Field(
        default=None, ge=8, le=512, description="Cap on generated tokens"
    )


class BatchTranslationRequest(BaseModel):
    texts: List[str] = Field(
        ..., min_length=1, max_length=20, description="English texts (max 20 per request)"
    )


@router.get("/status")
async def translation_status() -> Dict[str, Any]:
    """
    Reports whether the English->Maasai translator is usable in this deployment,
    including missing dependencies or a pending weights download.

    Useful for the frontend to show a "translation unavailable" notice instead of
    a failed request.
    """
    return check_availability()


@router.post("", include_in_schema=True)
@router.post("/", include_in_schema=False)
async def translate_text(request: TranslationRequest) -> Dict[str, Any]:
    """
    Translates English text into Maasai using the community-trained LoRA adapter.

    The first call downloads the base model and adapter (~3.5 GB) and can take
    several minutes; subsequent calls take a few seconds on CPU.

    Note: the adapter was trained on a small parallel corpus (sacreBLEU 7.2,
    chrF++ 36.5). Output captures the meaning but may vary in spelling from
    standard orthography, so it should be reviewed by a Maa speaker before it is
    relied on for anything community-facing.
    """
    try:
        # get_translator() triggers a multi-GB download on first use, so it must
        # not run on the event loop.
        translator = await run_in_threadpool(get_translator)
        result = await run_in_threadpool(
            translator.translate, request.text, request.max_new_tokens
        )
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {exc}",
        )

    result["license"] = "cc-by-nc-4.0 (non-commercial use only)"
    result["review_recommended"] = True
    return result


@router.post("/batch")
async def translate_batch(request: BatchTranslationRequest) -> Dict[str, Any]:
    """Translates several short English texts into Maasai in one request."""
    try:
        translator = await run_in_threadpool(get_translator)
        results = await run_in_threadpool(translator.translate_batch, request.texts)
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {exc}",
        )

    return {
        "count": len(results),
        "results": results,
        "license": "cc-by-nc-4.0 (non-commercial use only)",
        "review_recommended": True,
    }
