"""Test case models."""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum


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


class TestCaseRequest(BaseModel):
    """Request for test case generation."""

    __test__ = False
    requirements: str = Field(..., description="Requirements description (UI or API)")
    test_type: Literal["UI", "API"] = Field(..., description="Type of test")
    feature: str = Field(..., description="Feature name")
    story: str = Field(..., description="User story")
    owner: str = Field(..., description="Test owner")
    priority: Priority = Field(default=Priority.NORMAL, description="Test priority")
    jira_link: Optional[str] = Field(None, description="JIRA ticket link")
    jira_name: Optional[str] = Field(None, description="JIRA ticket name")


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


class TestCaseGenerationRequest(BaseModel):
    """Request for generating multiple test cases."""

    __test__ = False
    requirements: str = Field(..., description="Requirements description")
    test_type: Literal["UI", "API"] = Field(..., description="Type of test")
    feature: str = Field(..., description="Feature name")
    story: str = Field(..., description="User story")
    owner: str = Field(..., description="Test owner")
    count: int = Field(
        default=1, ge=1, le=10, description="Number of test cases to generate"
    )


class TestCaseResponse(BaseModel):
    """Response with generated test case."""

    __test__ = False
    test_case: TestCase
    generation_time: float
    model_used: str
