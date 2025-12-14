"""API routes for Kenzy QA Copilot."""

from fastapi import APIRouter, HTTPException, status
from app.models import (
    AnalyzeDefectRequest,
    AnalyzeDefectResponse,
    CommitTestCaseRequest,
    CommitTestCaseResponse,
    GenerateAutoTestCaseRequest,
    GenerateAutoTestCaseResponse,
    GenerateManualTestCaseRequest,
    GenerateManualTestCaseResponse,
    GenerateTestPlanRequest,
    GenerateTestPlanResponse,
    OptimizeTestCaseRequest,
    OptimizeTestCaseResponse,
    ValidateTestCaseRequest,
    ValidateTestCaseResponse,
)
from app.services import (
    AutoTestCaseGeneratorService,
    DefectAnalyzerService,
    GitLabAPIService,
    ManualTestCaseGeneratorService,
    OpenAPIParserService,
    OpenAIAPIService,
    TestOptimizerService,
    TestPlanGeneratorService,
    TestValidatorService,
)

router = APIRouter()

gitlab_api = GitLabAPIService()
openai_api = OpenAIAPIService()
openapi_parser = OpenAPIParserService()
auto_test_generator = AutoTestCaseGeneratorService(openai_api, openapi_parser)
defect_analyzer = DefectAnalyzerService(openai_api)
manual_test_generator = ManualTestCaseGeneratorService(openai_api)
test_optimizer = TestOptimizerService(openai_api)
test_validator = TestValidatorService(openai_api)
test_plan_generator = TestPlanGeneratorService(openai_api)


@router.post(
    "/defects/analyze",
    response_model=AnalyzeDefectResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze historical defects",
    description="Identify hotspots and recommendations from historical defects",
)
async def analyze_defects(request: AnalyzeDefectRequest) -> AnalyzeDefectResponse:
    """Analyze historical defects for hotspots."""
    try:
        return await defect_analyzer.analyze(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing defects: {str(e)}",
        )


@router.post(
    "/test-cases/commit",
    response_model=CommitTestCaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Commit test cases to GitLab",
    description="Create or update a file with test cases in GitLab",
)
async def commit_test_cases(request: CommitTestCaseRequest) -> CommitTestCaseResponse:
    """Commit test cases to GitLab."""
    try:
        return await gitlab_api.commit_file(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error committing test cases to GitLab: {str(e)}",
        )


@router.post(
    "/test-cases/generate-auto",
    response_model=GenerateAutoTestCaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate automated tests",
    description="Generate automated e2e UI or API tests from test cases and specifications",
)
async def generate_auto_test_cases(
    request: GenerateAutoTestCaseRequest,
) -> GenerateAutoTestCaseResponse:
    """Generate automated tests."""
    try:
        return await auto_test_generator.generate(request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating automated tests: {str(e)}",
        )


@router.post(
    "/test-cases/generate-manual",
    response_model=GenerateManualTestCaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate manual test cases",
    description="Generate manual test cases in Allure TestOps as Code format from requirements",
)
async def generate_manual_test_case(
    request: GenerateManualTestCaseRequest,
) -> GenerateManualTestCaseResponse:
    """Generate manual test cases."""
    try:
        return await manual_test_generator.generate(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating test case: {str(e)}",
        )


@router.post(
    "/test-cases/optimize",
    response_model=OptimizeTestCaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimize test cases",
    description="Analyze test coverage, find duplicates, identify gaps, and suggest improvements",
)
async def optimize_test_cases(
    request: OptimizeTestCaseRequest,
) -> OptimizeTestCaseResponse:
    """Optimize test cases."""
    try:
        return await test_optimizer.optimize(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error optimizing test cases: {str(e)}",
        )


@router.post(
    "/test-cases/validate",
    response_model=ValidateTestCaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate test cases",
    description="Validate test cases against Allure standards and AAA pattern",
)
async def validate_test_cases(
    request: ValidateTestCaseRequest,
) -> ValidateTestCaseResponse:
    """Validate test cases."""
    try:
        return await test_validator.validate(request)
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
    response_model=GenerateTestPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a test plan",
    description="Generate a concise, structured test plan from goals, scope, and risks",
)
async def generate_test_plan(
    request: GenerateTestPlanRequest,
) -> GenerateTestPlanResponse:
    """Generate a test plan."""
    try:
        return await test_plan_generator.generate(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating test plan: {str(e)}",
        )
