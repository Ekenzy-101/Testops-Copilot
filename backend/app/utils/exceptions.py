"""Custom exceptions."""

from fastapi import HTTPException, status


class TestOpsException(HTTPException):
    """Base exception for Kenzy QA Copilot."""

    pass


class OpenAIAPIError(TestOpsException):
    """OpenAI API error."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI API error: {detail}",
        )


class GitLabAPIError(TestOpsException):
    """GitLab API error."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitLab API error: {detail}",
        )


class OpenAPIParseError(TestOpsException):
    """OpenAPI parsing error."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OpenAPI parsing error: {detail}",
        )


class TestGenerationError(TestOpsException):
    """Test generation error."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test generation error: {detail}",
        )
