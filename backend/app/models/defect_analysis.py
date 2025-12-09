"""Historical defect analysis models."""

from typing import List, Optional
from pydantic import BaseModel, Field


class DefectRecord(BaseModel):
    """Single historical defect entry."""

    id: Optional[str] = Field(None, description="Defect identifier (Jira, etc.)")
    title: str = Field(..., description="Defect title or summary")
    component: Optional[str] = Field(None, description="Component or module")
    severity: Optional[str] = Field(None, description="Severity (e.g., Critical/High)")
    area: Optional[str] = Field(None, description="Functional area or feature")
    tags: List[str] = Field(default_factory=list, description="Labels or tags")
    description: Optional[str] = Field(None, description="Detailed description")


class DefectAnalysisRequest(BaseModel):
    """Request for analyzing historical defects."""

    defects: List[DefectRecord] = Field(
        ..., description="List of historical defects to analyze"
    )
    requirements: Optional[str] = Field(
        None, description="Current requirements to align analysis"
    )


class DefectHotspot(BaseModel):
    """Identified hotspot or risk area."""

    area: str
    risk: str
    recommendation: str
    priority: str


class DefectAnalysisResponse(BaseModel):
    """Response with hotspot insights and recommendations."""

    hotspots: List[DefectHotspot] = Field(
        default_factory=list, description="Areas with elevated risk"
    )
    summary: str = Field(..., description="Summary of findings")
    model_used: str = Field(..., description="LLM model used")

