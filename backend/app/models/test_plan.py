"""Test plan generation models."""

from pydantic import BaseModel, Field
from typing import List, Optional


class TestPlanRequest(BaseModel):
    """Request for test plan generation."""

    __test__ = False
    product: str = Field(..., description="Product or system under test")
    goals: List[str] = Field(..., description="Testing goals/objectives")
    scope: str = Field(..., description="In-scope functionality or features")
    out_of_scope: Optional[str] = Field(None, description="Out-of-scope areas")
    risks: Optional[str] = Field(None, description="Known risks and constraints")
    environments: Optional[str] = Field(
        None, description="Environments and platforms to cover"
    )
    timelines: Optional[str] = Field(None, description="Timelines or milestones")


class TestPlanResponse(BaseModel):
    """Generated test plan."""

    __test__ = False
    plan: str = Field(..., description="Structured test plan text")
    sections: List[str] = Field(
        ..., description="List of section titles included in the plan"
    )
    model_used: str = Field(..., description="LLM model used")
