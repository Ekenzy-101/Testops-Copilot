import pytest
from pytest_httpx import HTTPXMock
from app.config import settings
from app.models import AnalyzeDefectRequest, DefectRecord
from app.services import DefectAnalyzerService, OpenAIAPIService


@pytest.mark.asyncio
async def test_defect_analyzer_parses_hotspots(httpx_mock: HTTPXMock):
    svc = DefectAnalyzerService(OpenAIAPIService())
    content = "- Hotspot A | risk | fix | HIGH"
    httpx_mock.add_response(
        url=f"{settings.openai_api_url}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": content}}]},
        status_code=200,
    )
    req = AnalyzeDefectRequest(
        defects=[
            DefectRecord(
                id="D1",
                title="Null pointer",
                component="API",
                severity="High",
                area="Compute",
                tags=["regression"],
            )
        ]
    )
    res = await svc.analyze(req)
    assert res.hotspots
    assert res.hotspots[0].priority == "HIGH"
