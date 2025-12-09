"""Automated test generation models."""

from pydantic import BaseModel, Field
from typing import Optional, Literal, List


class UITestRequest(BaseModel):
    """Request for UI e2e test generation."""

    test_cases: List[str] = Field(..., description="Test case code strings")
    requirements: str = Field(..., description="UI requirements description")
    framework: Literal["pytest", "playwright", "selenium"] = Field(
        default="pytest", description="Test framework"
    )
    browser: Optional[str] = Field(None, description="Target browser")


class APITestRequest(BaseModel):
    """Request for API test generation."""

    openapi_spec: str = Field(
        ..., description="OpenAPI 3.0 specification (YAML or JSON)"
    )
    test_cases: Optional[List[str]] = Field(
        None, description="Optional test case code strings"
    )
    base_url: str = Field(..., description="API base URL")
    auth_token: Optional[str] = Field(
        None, description="Bearer token for authentication"
    )
    endpoints: Optional[List[str]] = Field(
        None, description="Specific endpoints to test"
    )


class AutomatedTestRequest(BaseModel):
    """Generic automated test generation request."""

    test_type: Literal["UI", "API"]
    ui_request: Optional[UITestRequest] = None
    api_request: Optional[APITestRequest] = None


class AutomatedTestResponse(BaseModel):
    """Response with generated automated tests."""

    test_code: str = Field(..., description="Generated pytest test code")
    test_count: int = Field(..., description="Number of generated tests")
    framework: str = Field(..., description="Test framework used")
    dependencies: List[str] = Field(
        default_factory=list, description="Required dependencies"
    )
    generation_time: float
    model_used: str
