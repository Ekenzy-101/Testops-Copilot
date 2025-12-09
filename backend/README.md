# Kenzy QA Copilot - Backend MVP v1.1

AI-powered test automation assistant for QA engineers.

## Features

- **Manual Test Case Generation**: Generate Allure TestOps as Code test cases from requirements
- **Automated Test Generation**: Generate e2e UI and API tests from test cases and specifications
- **Test Case Optimization**: Analyze coverage, find duplicates, and suggest improvements
- **Test Case Validation**: Validate test cases against Allure standards and AAA pattern

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

3. Run the application:

```bash
uvicorn app.main:app --reload
```

## Environment

Create `.env` from the example and fill secrets:

```
cp .env.example .env
```

Required variables:

- `OPENAI_API_KEY` – Cloud.ru Evolution Foundation Model token
- `OPENAI_API_URL` – API base (default: https://foundation-models.api.cloud.ru/v1)
- `OPENAI_MODEL` – Model name (default: ai-sage/GigaChat3-10B-A1.8B)
- `GITLAB_ACCESS_TOKEN` – Personal Access Token for GitLab API
- `APP_ORIGINS` – Comma-separated CORS origins (default: \*)

## API Documentation

Once running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
