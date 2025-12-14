import pytest
from app.services import OpenAIAPIService


@pytest.mark.asyncio
async def test_openai_api_checks_health():
    svc = OpenAIAPIService()
    assert await svc.health_check()
