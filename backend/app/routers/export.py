import io
import json
from fastapi import APIRouter, Query, Response
import pandas as pd

from ..database import get_all_records

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("")
async def export_data(format: str = Query("json", pattern="^(json|csv)$")):
    """
    Exports combined narrative analysis and metadata in CSV or JSON.
    Enables offline research evaluation and cross-validation against CBO records (Objective 2).
    """
    records = get_all_records()

    if format == "csv":
        # Flatten detected markers into a readable comma-separated string for CSV export
        flattened = []
        for r in records:
            item = dict(r)
            markers = item.get("detected_markers", [])
            item["detected_markers"] = "; ".join([f"{m.get('term')} ({m.get('category')})" for m in markers])
            flattened.append(item)

        df = pd.DataFrame(flattened)
        output = io.StringIO()
        df.to_csv(output, index=False)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=harmful_practice_narratives.csv"}
        )

    return Response(
        content=json.dumps(records, indent=2, ensure_ascii=False),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=harmful_practice_narratives.json"}
    )
