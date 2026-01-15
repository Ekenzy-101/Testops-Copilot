"""Main FastAPI application."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(
        content={"message": exc.detail},
        headers=exc.headers,
        status_code=exc.status_code,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    details = {}
    for error in exc.errors():
        field = ".".join(map(str, error["loc"][1:]))
        details[field] = error["msg"]

    return JSONResponse(
        content={"message": "Invalid request parameters", "details": details},
        headers=exc.headers,
        status_code=exc.status_code,
    )


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }
