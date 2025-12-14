"""Test case models."""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

# Test case commit models.


class CommitTestCaseRequest(BaseModel):
    """Request for test case commit."""

    branch: str = Field(default="main", description="Target branch")
    commit_message: str = Field(..., description="Commit message")
    content: str = Field(..., description="File content to commit")
    file_path: str = Field(..., description="Path of the file to create/update")
    project_id: str = Field(..., description="GitLab project ID or path")


class CommitTestCaseResponse(BaseModel):
    """Response for test case commit."""

    branch: str
    commit_id: str | None = None
    file_path: str
    project_id: str
    status: str


# Test case optimization models.
class GapSeverity(str, Enum):
    """Severity of coverage gap."""

    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class CoverageAnalysis(BaseModel):
    """Coverage analysis result."""

    total_functionality: int = Field(..., description="Total functionality items")
    covered_functionality: int = Field(..., description="Covered functionality items")
    coverage_percentage: float = Field(..., description="Coverage percentage")
    covered_areas: List[str] = Field(
        default_factory=list, description="List of covered areas"
    )
    uncovered_areas: List[str] = Field(
        default_factory=list, description="List of uncovered areas"
    )


class DuplicateTest(BaseModel):
    """Duplicate test identification."""

    test_id_1: str
    test_id_2: str
    similarity_score: float = Field(
        ..., ge=0.0, le=1.0, description="Similarity score 0-1"
    )
    reason: str = Field(..., description="Reason for duplication")
    recommendation: str = Field(..., description="Recommendation to resolve")


class CoverageGap(BaseModel):
    """Coverage gap identification."""

    functionality: str = Field(..., description="Uncovered functionality")
    severity: GapSeverity = Field(..., description="Severity of the gap")
    description: str = Field(..., description="Description of the gap")
    suggested_tests: List[str] = Field(
        default_factory=list, description="Suggested test cases to cover"
    )


class OptimizationSuggestion(BaseModel):
    """Optimization suggestion."""

    test_id: Optional[str] = Field(None, description="Related test ID if applicable")
    suggestion_type: str = Field(..., description="Type of suggestion")
    description: str = Field(..., description="Description of suggestion")
    impact: str = Field(..., description="Expected impact")
    effort: str = Field(..., description="Estimated effort")


class OptimizeTestCaseRequest(BaseModel):
    """Request for test case optimization."""

    test_cases: List[str] = Field(..., description="List of test case code strings")
    requirements: str = Field(..., description="Requirements description")


class OptimizeTestCaseResponse(BaseModel):
    """Response for test case optimization."""

    coverage_analysis: CoverageAnalysis
    duplicates: List[DuplicateTest]
    coverage_gaps: List[CoverageGap]
    suggestions: List[OptimizationSuggestion]
    outdated_tests: List[str] = Field(
        default_factory=list, description="List of outdated test IDs"
    )
    conflicting_tests: List[str] = Field(
        default_factory=list, description="List of conflicting test IDs"
    )


# Automated test case generation models
class UITestRequest(BaseModel):
    """Request for UI e2e test case generation."""

    test_cases: List[str] = Field(..., description="Test case code strings")
    requirements: str = Field(..., description="UI requirements description")
    framework: Literal["pytest", "playwright", "selenium"] = Field(
        default="pytest", description="Test framework"
    )
    browser: Optional[str] = Field(None, description="Target browser")


class APITestRequest(BaseModel):
    """Request for API test case generation."""

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


class GenerateAutoTestCaseRequest(BaseModel):
    """Request for automated test case generation."""

    test_type: Literal["UI", "API"]
    ui_request: Optional[UITestRequest] = None
    api_request: Optional[APITestRequest] = None


class GenerateAutoTestCaseResponse(BaseModel):
    """Response for automated test case generation."""

    test_code: str = Field(..., description="Generated pytest test code")
    test_count: int = Field(..., description="Number of generated tests")
    framework: str = Field(..., description="Test framework used")
    dependencies: List[str] = Field(
        default_factory=list, description="Required dependencies"
    )
    generation_time: float
    model_used: str


# Manual test case generation models
class Priority(str, Enum):
    """Test priority levels."""

    CRITICAL = "CRITICAL"
    NORMAL = "NORMAL"
    LOW = "LOW"


class TestCaseStep(BaseModel):
    """Single step in a test case."""

    __test__ = False
    step_number: int
    description: str
    action: str
    expected_result: str


class TestCase(BaseModel):
    """Generated test case."""

    __test__ = False
    title: str
    function_name: str
    feature: str
    story: str
    owner: str
    priority: Priority
    test_type: str
    suite: str
    jira_link: Optional[str] = None
    jira_name: Optional[str] = None
    steps: List[TestCaseStep]
    arrange_section: str
    act_section: str
    assert_section: str
    code: str = Field(
        ..., description="Generated Python code in Allure TestOps as Code format"
    )


class GenerateManualTestCaseRequest(BaseModel):
    """Request for manual test case generation."""

    __test__ = False
    requirements: str = Field(..., description="Requirements description (UI or API)")
    test_type: Literal["UI", "API"] = Field(..., description="Type of test")
    feature: str = Field(..., description="Feature name")
    story: str = Field(..., description="User story")
    owner: str = Field(..., description="Test owner")
    priority: Priority = Field(default=Priority.NORMAL, description="Test priority")
    jira_link: Optional[str] = Field(None, description="JIRA ticket link")
    jira_name: Optional[str] = Field(None, description="JIRA ticket name")


class GenerateManualTestCaseResponse(BaseModel):
    """Response for manual test case generation"""

    __test__ = False
    test_case: TestCase
    generation_time: float
    model_used: str


# Test case validation models


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
    allure_decorators_complete: bool = Field(
        ..., description="Allure decorators completeness"
    )
    structure_valid: bool = Field(..., description="Test structure validity")


class ValidateTestCaseRequest(BaseModel):
    """Request for test case validation."""

    test_cases: List[str] = Field(
        ..., description="List of test case code strings to validate"
    )
    strict_mode: bool = Field(default=False, description="Use strict validation mode")


class ValidateTestCaseResponse(BaseModel):
    """Response for test case validation."""

    total_tests: int
    valid_tests: int
    invalid_tests: int
    results: List[ValidationResult]
    overall_compliance: float = Field(
        ..., ge=0.0, le=1.0, description="Overall compliance score 0-1"
    )
    summary: str = Field(..., description="Summary of validation")
