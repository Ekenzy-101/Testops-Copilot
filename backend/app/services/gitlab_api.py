"""GitLab API integration service."""

import urllib.parse
import httpx
import logging
from app.config import settings
from app.models import CommitTestCaseRequest, CommitTestCaseResponse

logger = logging.getLogger(__name__)


class GitLabAPIService:
    """Service for interacting with GitLab API."""

    def __init__(self):
        self.api_url = settings.gitlab_api_url
        self.timeout = settings.gitlab_api_timeout
        self.token = settings.gitlab_access_token
        self.headers = {
            "PRIVATE-TOKEN": self.token,
            "Content-Type": "application/json",
        }

    async def commit_file(
        self, request: CommitTestCaseRequest
    ) -> CommitTestCaseResponse:
        """Create or update a file in GitLab repository."""
        path = urllib.parse.quote(request.file_path, safe="")
        id = urllib.parse.quote(request.project_id, safe="")
        url = f"{self.api_url}/projects/{id}/repository/files/{path}"
        json = {
            "branch": request.branch,
            "content": request.content,
            "commit_message": request.commit_message,
            "encoding": "text",
        }
        params = {"ref": request.branch}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            result = {}
            try:
                # Check if file exists
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                result = response.json()
                response = await client.put(url, headers=self.headers, json=json)
                response.raise_for_status()
            except httpx.HTTPError:
                # File doesn't exist, create it
                response = await client.post(url, headers=self.headers, json=json)
                response.raise_for_status()
                result = response.json()
            return CommitTestCaseResponse(
                status="committed",
                project_id=request.project_id,
                branch=request.branch,
                file_path=request.file_path,
                commit_id=result.get("commit_id"),
            )

    async def health_check(self) -> bool:
        """Check if GitLab API is available."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.api_url}/version", headers=self.headers
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"GitLabAPIService: {e}")
            return False
