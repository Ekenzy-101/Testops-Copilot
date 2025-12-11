# Kenzy QA Copilot Монорепозиторий

- [English](README.md)
- [Русский](README.ru.md)

Полнофункциональный AI-ассистент для QA с React фронтендом и FastAPI бэкендом.

- Фронтенд: `frontend/` — React 19 + Rsbuild + Snack UIKit UI.
- Бэкенд: `backend/` — FastAPI сервис, который взаимодействует с Cloud.ru LLM и GitLab.

## Быстрый старт

Требования: Node.js 22+ с npm, Python 3.13+ и доступ к OpenAI-совместимому API (Cloud.ru Evolution).

1. Запустите бэкенд
   - `cd backend`
   - `python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - `cp .env.example .env` и заполните `OPENAI_API_KEY`, `OPENAI_API_URL`, `OPENAI_MODEL`, `GITLAB_ACCESS_TOKEN`, `APP_ORIGINS`
   - `uvicorn app.app:app --reload --host 0.0.0.0 --port 8000`
2. Запустите фронтенд (новый терминал)
   - `cd frontend`
   - `npm install`
   - `cp .env.example .env` и установите `PUBLIC_API_BASE_URL` (по умолчанию `http://localhost:8000`)
   - `npm run dev` (откроется http://localhost:3000)

## Полезные команды

- Фронтенд: `npm run dev | build | preview | lint | format`
- Бэкенд: `uvicorn app.app:app --reload` для запуска сервера, `pytest` для тестов

## Документация

- [Руководство по фронтенду](frontend/README.ru.md)
- [Руководство по бэкенду](backend/README.ru.md)
