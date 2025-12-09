"""Main FastAPI application."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"OpenAI API URL: {settings.openai_api_url}")
    logger.info(f"GitLab API URL: {settings.gitlab_api_url}")
    yield
    logger.info(f"Shutting down {settings.app_name}")


app = FastAPI(
    description="AI-powered test automation assistant for QA engineers",
    docs_url="/docs",
    lifespan=lifespan,
    redoc_url="/redoc",
    version=settings.app_version,
    title=settings.app_name,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1", tags=["testops"])


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.app:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_debug,
    )
