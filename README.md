# Kenzy QA Copilot Monorepo

Full-stack AI-powered QA assistant with a React frontend and FastAPI backend.

- Frontend: `frontend/` — React 19 + Rsbuild + Snack UIKit UI.
- Backend: `backend/` — FastAPI service that talks to Cloud.ru LLMs and GitLab.

## Quick start

Prerequisites: Node.js 22+ with npm, Python 3.13+, and OpenAI-compatible API access (Cloud.ru Evolution).

1. Start the backend
   - `cd backend`
   - `python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - `cp .env.example .env` and fill `OPENAI_API_KEY`, `OPENAI_API_URL`, `OPENAI_MODEL`, `GITLAB_ACCESS_TOKEN`, `APP_ORIGINS`
   - `uvicorn app.app:app --reload --host 0.0.0.0 --port 8000`
2. Start the frontend (new terminal)
   - `cd frontend`
   - `npm install`
   - `cp .env.example .env` and set `PUBLIC_API_BASE_URL` (default `http://localhost:8000`)
   - `npm run dev` (opens http://localhost:3000)

## Useful commands

- Frontend: `npm run dev | build | preview | lint | format`
- Backend: `uvicorn app.app:app --reload` to serve, `pytest` for tests

## Documentation

- Frontend guide: `frontend/README.md`
- Backend guide: `backend/README.md`
