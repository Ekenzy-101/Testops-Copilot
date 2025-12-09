"""Test optimization models."""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


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
    covered_areas: List[str] = Field(default_factory=list, description="List of covered areas")
    uncovered_areas: List[str] = Field(default_factory=list, description="List of uncovered areas")


class DuplicateTest(BaseModel):
    """Duplicate test identification."""
    test_id_1: str
    test_id_2: str
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score 0-1")
    reason: str = Field(..., description="Reason for duplication")
    recommendation: str = Field(..., description="Recommendation to resolve")


class CoverageGap(BaseModel):
    """Coverage gap identification."""
    functionality: str = Field(..., description="Uncovered functionality")
    severity: GapSeverity = Field(..., description="Severity of the gap")
    description: str = Field(..., description="Description of the gap")
    suggested_tests: List[str] = Field(default_factory=list, description="Suggested test cases to cover")


class OptimizationSuggestion(BaseModel):
    """Optimization suggestion."""
    test_id: Optional[str] = Field(None, description="Related test ID if applicable")
    suggestion_type: str = Field(..., description="Type of suggestion")
    description: str = Field(..., description="Description of suggestion")
    impact: str = Field(..., description="Expected impact")
    effort: str = Field(..., description="Estimated effort")


class OptimizationRequest(BaseModel):
    """Request for test case optimization."""
    test_cases: List[str] = Field(..., description="List of test case code strings")
    requirements: str = Field(..., description="Requirements description")


class OptimizationReport(BaseModel):
    """Complete optimization report."""
    coverage_analysis: CoverageAnalysis
    duplicates: List[DuplicateTest]
    coverage_gaps: List[CoverageGap]
    suggestions: List[OptimizationSuggestion]
    outdated_tests: List[str] = Field(default_factory=list, description="List of outdated test IDs")
    conflicting_tests: List[str] = Field(default_factory=list, description="List of conflicting test IDs")

