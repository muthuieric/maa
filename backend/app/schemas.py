from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class NarrativeSubmission(BaseModel):
    narrative: str = Field(..., min_length=5, description="Community narrative text in Swahili or Maa")
    language: str = Field(..., description="Language: Swahili or Maa")
    age_band: str = Field(..., description="Age category: Under 18, 18-25, 26-40, Over 40")
    gender: str = Field(..., description="Gender: Female, Male, Other")
    sub_county: str = Field(..., description="Narok or Kajiado sub-county")
    source_org: str = Field(..., description="Community-based organisation (e.g., Tareto Africa Trust)")
    label: str = Field(..., description="Ground truth annotation label: FGM, Child marriage, Other, None")
    consent_given: bool = Field(..., description="Mandatory informed consent confirmation")

class PredictionResult(BaseModel):
    prediction_label: str
    prediction_score: float
    confidence_breakdown: Dict[str, float]
    detected_markers: List[Dict[str, Any]]
    discourse_stance: str
    cultural_context_notes: str

class SubmitResponse(BaseModel):
    message: str
    narrative_id: str
    analysis: PredictionResult

class NarrativeRecord(BaseModel):
    narrative_id: str
    age_band: str
    gender: str
    sub_county: str
    source_org: str
    consent_given: bool
    date_collected: str
    narrative: str
    language: str
    label: str
    prediction_label: str
    prediction_score: float
    discourse_stance: str
    detected_markers: List[Dict[str, Any]]
    cultural_context_notes: str

class StatsResponse(BaseModel):
    total_narratives: int
    by_language: Dict[str, int]
    by_category: Dict[str, int]
    by_sub_county: Dict[str, int]
    by_stance: Dict[str, int]
    consent_compliance_rate: float

class BatchImportRequest(BaseModel):
    source_org: str = Field(default="Tareto Africa Trust", description="Partner CBO name")
    narratives: List[NarrativeSubmission] = Field(..., min_length=1)

class BatchImportResponse(BaseModel):
    total_submitted: int
    imported_count: int
    rejected_count: int
    validation_report: Dict[str, Any]
