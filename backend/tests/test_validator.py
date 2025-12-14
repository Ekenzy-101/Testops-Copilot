import pytest
from pytest_httpx import HTTPXMock
from app.config import settings
from app.models import ValidateTestCaseRequest
from app.services import OpenAIAPIService, TestValidatorService


@pytest.mark.asyncio
async def test_validator_validates(
    httpx_mock: HTTPXMock, mock_api_manual_test: str, mock_ui_manual_test: str
):
    svc = TestValidatorService(OpenAIAPIService())
    httpx_mock.add_response(
        url=f"{settings.openai_api_url}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": "{'issues' : []}"}}]},
        status_code=200,
    )
    httpx_mock.add_response(
        url=f"{settings.openai_api_url}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": "{'issues' : []}"}}]},
        status_code=200,
    )
    req = ValidateTestCaseRequest(
        strict_mode=False,
        test_cases=[mock_api_manual_test, mock_ui_manual_test],
    )
    res = await svc.validate(req)
    print(res.results)
    assert res.valid_tests == len(req.test_cases)
    assert res.total_tests == len(req.test_cases)
    assert res.overall_compliance == 1
