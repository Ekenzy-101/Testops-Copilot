"""GitLab API integration service."""

import urllib.parse
import httpx
import logging
from typing import Optional, Dict, Any, List
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

    async def get_project(self, project_id: str) -> Dict[str, Any]:
        """
        Get project information.

        Args:
            project_id: GitLab project ID or path

        Returns:
            Project information
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.api_url}/projects/{project_id}", headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"GitLab API error: {e}")
                raise

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

    async def get_ci_pipelines(
        self, project_id: str, per_page: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get CI/CD pipelines for a project.

        Args:
            project_id: GitLab project ID or path
            per_page: Number of pipelines per page

        Returns:
            List of pipelines
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.api_url}/projects/{project_id}/pipelines",
                    headers=self.headers,
                    params={"per_page": per_page},
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"GitLab API error: {e}")
                raise

    async def trigger_pipeline(
        self,
        project_id: str,
        ref: str = "main",
        variables: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Trigger a CI/CD pipeline.

        Args:
            project_id: GitLab project ID or path
            ref: Branch or tag to run pipeline on
            variables: Optional pipeline variables

        Returns:
            Pipeline information
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                json = {"ref": ref}
                if variables:
                    json["variables"] = [
                        {"key": k, "value": v} for k, v in variables.items()
                    ]

                response = await client.post(
                    f"{self.api_url}/projects/{project_id}/pipeline",
                    headers=self.headers,
                    json=json,
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"GitLab API error: {e}")
                raise

    async def health_check(self) -> bool:
        """Check if GitLab API is available."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.api_url}/version", headers=self.headers
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"GitLab API health check failed: {e}")
            return False
