import asyncio
import urllib
import pytest
from pytest_httpx import HTTPXMock

from app.models.test_plan import TestPlanRequest
from app.models.defect_analysis import DefectAnalysisRequest, DefectRecord
from app.models.gitlab_api import GitLabCommitRequest
from app.services.test_plan_generator import TestPlanGeneratorService
from app.services.defect_analyzer import DefectAnalyzerService
from app.services.gitlab_api import GitLabAPIService
from app.services.openapi_parser import OpenAPIParserService
from app.config import settings


class DummyOpenAI:
    model = "dummy-model"

    async def generate(self, prompt: str, system_prompt: str | None = None, **kwargs):
        return (
            "Objectives:\n- Goal A\nScope:\n- Area A\nApproach:\n- Strategy A\n"
            "Hotspot A | risk | fix | HIGH"
        )


@pytest.mark.asyncio
async def test_test_plan_generator_returns_sections():
    svc = TestPlanGeneratorService(DummyOpenAI())
    req = TestPlanRequest(
        product="Calc",
        goals=["Reliability"],
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


@pytest.mark.asyncio
async def test_defect_analyzer_parses_hotspots():
    svc = DefectAnalyzerService(DummyOpenAI())
    req = DefectAnalysisRequest(
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


@pytest.mark.asyncio
async def test_gitlab_api_commit_response(httpx_mock: HTTPXMock):
    path = urllib.parse.quote("tests/test_sample.py", safe="")
    httpx_mock.add_response(
        url=f"{settings.gitlab_api_url}/projects/1/repository/files/{path}?ref=main",
        method="GET",
        json={"commit_id": "d42409d56517157c48bf3bd97d3f75974dde19fb"},
        status_code=200,
    )
    httpx_mock.add_response(
        url=f"{settings.gitlab_api_url}/projects/1/repository/files/{path}",
        method="PUT",
        json={"commit_id": "d42409d56517157c48bf3bd97d3f75974dde19fb"},
        status_code=200,
    )

    svc = GitLabAPIService()
    req = GitLabCommitRequest(
        project_id="1",
        file_path="tests/test_sample.py",
        content="# tests",
        branch="main",
        commit_message="add tests",
    )
    res = await svc.commit_file(req)
    assert res.branch == req.branch
    assert res.commit_id == "d42409d56517157c48bf3bd97d3f75974dde19fb"
    assert res.file_path == req.file_path
    assert res.status == "committed"


def test_openapi_parser_extracts_endpoints():
    parser = OpenAPIParserService()
    sample = """
openapi: 3.0.0
paths:
  /ping:
    get:
      summary: ping
      responses:
        '200':
          description: ok
"""
    spec = parser.parse(sample, format="yaml")
    eps = parser.get_endpoints(spec)
    assert len(eps) == 1
    assert eps[0]["path"] == "/ping"
