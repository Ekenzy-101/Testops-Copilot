"""Test validation models."""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class IssueSeverity(str, Enum):
    """Validation issue severity."""
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"


class ValidationIssue(BaseModel):
    """Single validation issue."""
    severity: IssueSeverity
    field: str = Field(..., description="Field or section with issue")
    issue: str = Field(..., description="Description of the issue")
    recommendation: str = Field(..., description="Recommendation to fix")


class ValidationResult(BaseModel):
    """Validation result for a single test case."""
    test_id: str
    is_valid: bool
    issues: List[ValidationIssue]
    aaa_compliance: bool = Field(..., description="AAA pattern compliance")
    allure_decorators_complete: bool = Field(..., description="Allure decorators completeness")
    structure_valid: bool = Field(..., description="Test structure validity")


class ValidationRequest(BaseModel):
    """Request for test case validation."""
    test_cases: List[str] = Field(..., description="List of test case code strings to validate")
    strict_mode: bool = Field(default=False, description="Use strict validation mode")


class ValidationReport(BaseModel):
    """Complete validation report."""
    total_tests: int
    valid_tests: int
    invalid_tests: int
    results: List[ValidationResult]
    overall_compliance: float = Field(..., ge=0.0, le=1.0, description="Overall compliance score 0-1")
    summary: str = Field(..., description="Summary of validation")


