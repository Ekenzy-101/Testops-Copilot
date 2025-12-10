# Kenzy QA Copilot - Backend

FastAPI service powering the QA copilot features.

## Features

- Automated Test Case Generation: generate e2e UI/API tests from specs
- Defect Analysis: identify hotspots and recommendations from historical defects.
- Manual Test Case Generation: produce Allure TestOps-as-Code from requirements
- Test Case Commit: commit tests to GitLab
- Test Case Optimization: detect duplicates, gaps, and improvements
- Test Case Validation: enforce Allure standards and AAA pattern
- Test Plan Generation: produce a concise, structured test plan from goals, scope, and risks.

## Prerequisites

- Python 3.13+ (recommended)
- pip and virtualenv

## Setup

1. Create and activate a virtual env:
   - `python -m venv .venv && source .venv/bin/activate`
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Configure environment:
   - `cp .env.example .env`
   - Set the required values (see below)

### Required environment variables

- `OPENAI_API_KEY` – Cloud.ru Evolution Foundation Model token
- `OPENAI_API_URL` – API base (default: https://foundation-models.api.cloud.ru/v1)
- `OPENAI_MODEL` – Model name (default: ai-sage/GigaChat3-10B-A1.8B)
- `GITLAB_ACCESS_TOKEN` – GitLab Personal Access Token
- `APP_ORIGINS` – Comma-separated CORS origins (default: \*)

## Running locally

```
uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

API docs after startup:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

- Run the test suite: `pytest`
- Tests live under `tests/`

## Project layout

- `app/` — FastAPI app, routers, services
- `tests/` — automated tests
