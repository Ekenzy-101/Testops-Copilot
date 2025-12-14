import pytest
from pytest_httpx import HTTPXMock
from app.config import settings
from app.models import GenerateTestPlanRequest
from app.services import OpenAIAPIService, TestPlanGeneratorService


@pytest.mark.asyncio
async def test_plan_generator(httpx_mock: HTTPXMock):
    svc = TestPlanGeneratorService(OpenAIAPIService())
    content = "Objectives:\n- Goal A\nScope:\n- Area A\nApproach:\n- Strategy A\n"
    httpx_mock.add_response(
        url=f"{settings.openai_api_url}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": content}}]},
        status_code=200,
    )
    req = GenerateTestPlanRequest(
        product="Calc",
        goals="Reliability",
        scope="Add/Remove items",
        out_of_scope=None,
        risks="Performance",
        environments="Web",
        timelines="Sprint 1",
    )
    res = await svc.generate(req)
    assert "Objectives" in res.plan
    assert "Scope" in res.plan
    assert len(res.sections) >= 1
