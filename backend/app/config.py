"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # App
    app_host: str = "0.0.0.0"
    app_name: str = "Kenzy QA Copilot"
    app_port: int = 8000
    app_version: str = "1.1.0"
    app_debug: bool = False
    app_origins: str = "*"
    log_level: str = "INFO"

    # GitLab API
    gitlab_access_token: str
    gitlab_api_url: str = "https://gitlab.com/api/v4"
    gitlab_api_timeout: int = 10

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # OpenAI API
    openai_api_key: str
    openai_api_url: str = "https://foundation-models.api.cloud.ru/v1"
    openai_model: str = "ai-sage/GigaChat3-10B-A1.8B"


settings = Settings()
