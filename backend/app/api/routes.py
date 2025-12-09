"""API routes for Kenzy QA Copilot."""

from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models import (
    AutomatedTestRequest,
    AutomatedTestResponse,
    OptimizationRequest,
    OptimizationReport,
    TestCaseGenerationRequest,
    TestCaseRequest,
    TestCaseResponse,
    ValidationRequest,
    ValidationReport,
    GitLabCommitRequest,
    GitLabCommitResponse,
    TestPlanRequest,
    TestPlanResponse,
    DefectAnalysisRequest,
    DefectAnalysisResponse,
)
from app.services import (
    OpenAIAPIService,
    TestCaseGeneratorService,
    AutomatedTestGeneratorService,
    TestOptimizerService,
    TestValidatorService,
    OpenAPIParserService,
    GitLabAPIService,
    TestPlanGeneratorService,
    DefectAnalyzerService,
)

router = APIRouter()

gitlab_api = GitLabAPIService()
openai_api = OpenAIAPIService()
openapi_parser = OpenAPIParserService()
automated_test_generator = AutomatedTestGeneratorService(openai_api, openapi_parser)
test_case_generator = TestCaseGeneratorService(openai_api)
test_optimizer = TestOptimizerService(openai_api)
test_validator = TestValidatorService(openai_api)
test_plan_generator = TestPlanGeneratorService(openai_api)
defect_analyzer = DefectAnalyzerService(openai_api)


@router.post(
    "/automated-tests/generate",
    response_model=AutomatedTestResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate automated tests",
    description="Generate automated e2e UI or API tests from test cases and specifications",
)
async def generate_automated_tests(
    request: AutomatedTestRequest,
) -> AutomatedTestResponse:
    """Generate automated tests."""
    try:
        return await automated_test_generator.generate_automated_tests(request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating automated tests: {str(e)}",
        )


@router.post(
    "/test-cases/commit",
    response_model=GitLabCommitResponse,
    status_code=status.HTTP_200_OK,
    summary="Commit generated test cases to GitLab",
    description="Create or update a file with generated test assets in GitLab",
)
async def commit_test_cases(request: GitLabCommitRequest) -> GitLabCommitResponse:
    """Commit generated test artifacts to GitLab."""
    try:
        return await gitlab_api.commit_file(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error committing to GitLab: {str(e)}",
        )


@router.post(
    "/test-cases/generate",
    response_model=TestCaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a single manual test case",
    description="Generate a manual test case in Allure TestOps as Code format from requirements",
)
async def generate_test_case(request: TestCaseRequest) -> TestCaseResponse:
    """Generate a single test case."""
    try:
        return await test_case_generator.generate_test_case(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating test case: {str(e)}",
        )


@router.post(
    "/test-cases/generate-batch",
    response_model=List[TestCaseResponse],
    status_code=status.HTTP_200_OK,
    summary="Generate multiple test cases",
    description="Generate multiple test cases in batch",
)
async def generate_test_cases(
    request: TestCaseGenerationRequest,
) -> List[TestCaseResponse]:
    """Generate multiple test cases."""
    try:
        return await test_case_generator.generate_test_cases(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating test cases: {str(e)}",
        )


@router.post(
    "/test-cases/optimize",
    response_model=OptimizationReport,
    status_code=status.HTTP_200_OK,
    summary="Optimize test cases",
    description="Analyze test coverage, find duplicates, identify gaps, and suggest improvements",
)
async def optimize_test_cases(request: OptimizationRequest) -> OptimizationReport:
    """Optimize test cases."""
    try:
        return await test_optimizer.generate_optimization_report(
            test_cases=request.test_cases, requirements=request.requirements
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error optimizing test cases: {str(e)}",
        )


@router.post(
    "/test-cases/validate",
    response_model=ValidationReport,
    status_code=status.HTTP_200_OK,
    summary="Validate test cases",
    description="Validate test cases against Allure standards and AAA pattern",
)
async def validate_test_cases(request: ValidationRequest) -> ValidationReport:
    """Validate test cases."""
    try:
        return await test_validator.validate_test_cases(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating test cases: {str(e)}",
        )


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Check service health and API connectivity",
)
async def health_check():
    """Health check endpoint."""
    openai_health = await openai_api.health_check()
    gitlab_health = await gitlab_api.health_check()

    return {
        "status": "healthy" if openai_health and gitlab_health else "degraded",
        "openai_api": "available" if openai_health else "unavailable",
        "gitlab_api": "available" if gitlab_health else "unavailable",
    }


@router.post(
    "/test-plan/generate",
    response_model=TestPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a test plan",
    description="Generate a concise, structured test plan from goals, scope, and risks",
)
async def generate_test_plan(request: TestPlanRequest) -> TestPlanResponse:
    """Generate a test plan."""
    try:
        return await test_plan_generator.generate(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating test plan: {str(e)}",
        )


@router.post(
    "/defects/analyze",
    response_model=DefectAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze historical defects",
    description="Identify hotspots and recommendations from historical defects",
)
async def analyze_defects(request: DefectAnalysisRequest) -> DefectAnalysisResponse:
    """Analyze historical defects for hotspots."""
    try:
        return await defect_analyzer.analyze(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing defects: {str(e)}",
        )
