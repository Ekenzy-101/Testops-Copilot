import urllib
import pytest
from pytest_httpx import HTTPXMock
from app.config import settings
from app.models import CommitTestCaseRequest
from app.services import GitLabAPIService


@pytest.mark.asyncio
async def test_gitlab_api_creates_file(httpx_mock: HTTPXMock):
    svc = GitLabAPIService()
    path = urllib.parse.quote("tests/test_sample.py", safe="")
    httpx_mock.add_response(
        url=f"{settings.gitlab_api_url}/projects/1/repository/files/{path}?ref=main",
        method="GET",
        json={"message": "Not found"},
        status_code=404,
    )
    httpx_mock.add_response(
        url=f"{settings.gitlab_api_url}/projects/1/repository/files/{path}",
        method="POST",
        json={"commit_id": "d42409d56517157c48bf3bd97d3f75974dde19fb"},
        status_code=200,
    )
    req = CommitTestCaseRequest(
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


@pytest.mark.asyncio
async def test_gitlab_api_updates_file(httpx_mock: HTTPXMock):
    svc = GitLabAPIService()
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
    req = CommitTestCaseRequest(
        project_id="1",
        file_path="tests/test_sample.py",
        content="# tests",
        branch="main",
        commit_message="update tests",
    )
    res = await svc.commit_file(req)
    assert res.branch == req.branch
    assert res.commit_id == "d42409d56517157c48bf3bd97d3f75974dde19fb"
    assert res.file_path == req.file_path
    assert res.status == "committed"


@pytest.mark.asyncio
async def test_gitlab_api_checks_heath():
    svc = GitLabAPIService()
    assert await svc.health_check() == True
