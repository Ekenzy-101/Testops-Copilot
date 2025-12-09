"""GitLab commit request/response models."""

from pydantic import BaseModel, Field


class GitLabCommitRequest(BaseModel):
    """Request payload for committing files to GitLab."""

    branch: str = Field(default="main", description="Target branch")
    commit_message: str = Field(..., description="Commit message")
    content: str = Field(..., description="File content to commit")
    file_path: str = Field(..., description="Path of the file to create/update")
    project_id: str = Field(..., description="GitLab project ID or path")


class GitLabCommitResponse(BaseModel):
    """Response payload for GitLab commit operation."""

    branch: str
    commit_id: str | None = None
    file_path: str
    project_id: str
    status: str
