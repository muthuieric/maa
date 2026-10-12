from fastapi import APIRouter
from collections import Counter
from ..database import get_all_records
from ..schemas import StatsResponse

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("", response_model=StatsResponse)
async def get_statistics():
    """Returns aggregated research statistics across narratives and demographic metadata."""
    records = get_all_records()
    total = len(records)

    if total == 0:
        return StatsResponse(
            total_narratives=0,
            by_language={},
            by_category={},
            by_sub_county={},
            by_stance={},
            consent_compliance_rate=1.0
        )

    languages = Counter([r.get("language") or "Unknown" for r in records])
    categories = Counter([r.get("prediction_label") or "Unclassified" for r in records])
    sub_counties = Counter([r.get("sub_county") or "Unknown" for r in records])
    stances = Counter([r.get("discourse_stance") or "Unknown" for r in records])
    consent_count = sum(1 for r in records if r.get("consent_given"))

    return StatsResponse(
        total_narratives=total,
        by_language=dict(languages),
        by_category=dict(categories),
        by_sub_county=dict(sub_counties),
        by_stance=dict(stances),
        consent_compliance_rate=round(consent_count / total, 4) if total > 0 else 1.0
    )

