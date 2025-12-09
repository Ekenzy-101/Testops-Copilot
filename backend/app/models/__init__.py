"""Data models and schemas."""

from .test_case import (
    Priority,
    TestCase,
    TestCaseStep,
    TestCaseRequest,
    TestCaseResponse,
    TestCaseGenerationRequest,
)
from .test_optimization import (
    CoverageAnalysis,
    DuplicateTest,
    CoverageGap,
    OptimizationSuggestion,
    OptimizationReport,
    OptimizationRequest,
)
from .test_validation import (
    ValidationResult,
    ValidationIssue,
    ValidationReport,
    ValidationRequest,
)
from .automated_test import (
    AutomatedTestRequest,
    AutomatedTestResponse,
    UITestRequest,
    APITestRequest,
)
from .gitlab_api import GitLabCommitRequest, GitLabCommitResponse
from .test_plan import TestPlanRequest, TestPlanResponse
from .defect_analysis import (
    DefectAnalysisRequest,
    DefectAnalysisResponse,
    DefectHotspot,
    DefectRecord,
)

__all__ = [
    "Priority",
    "TestCase",
    "TestCaseStep",
    "TestCaseRequest",
    "TestCaseResponse",
    "TestCaseGenerationRequest",
    "CoverageAnalysis",
    "DuplicateTest",
    "CoverageGap",
    "OptimizationSuggestion",
    "OptimizationReport",
    "OptimizationRequest",
    "ValidationResult",
    "ValidationIssue",
    "ValidationReport",
    "ValidationRequest",
    "AutomatedTestRequest",
    "AutomatedTestResponse",
    "UITestRequest",
    "APITestRequest",
    "GitLabCommitRequest",
    "GitLabCommitResponse",
    "TestPlanRequest",
    "TestPlanResponse",
    "DefectAnalysisRequest",
    "DefectAnalysisResponse",
    "DefectHotspot",
    "DefectRecord",
]
