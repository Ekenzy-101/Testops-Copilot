# Kenzy QA Copilot - Frontend

- [English](README.md)
- [Русский](README.ru.md)

React 19 + Snack UIKit UI for the QA copilot.

## Features

- Automated Test Case Generation: generate e2e UI/API tests from specs
- Defect Analysis: identify hotspots and recommendations from historical defects.
- Manual Test Case Generation: produce Allure TestOps-as-Code from requirements
- Test Case Commit: commit tests to GitLab
- Test Case Optimization: detect duplicates, gaps, and improvements
- Test Case Validation: enforce Allure standards and AAA pattern
- Test Plan Generation: produce a concise, structured test plan from goals, scope, and risks.

## Prerequisites

- Node.js 22+ with npm

## Setup

1. Install dependencies: `npm install`
2. Copy env: `cp .env.example .env`
3. Set `PUBLIC_API_BASE_URL` (default `http://localhost:8000`)
4. Start dev server: `npm run dev` (opens http://localhost:3000)

## Scripts

- `npm run dev` — start Rsbuild dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run format` — format with Prettier

## Project structure

```
src/
├── components/            # Reusable UI Components (e.g., Layout)
├── pages/                 # Feature pages
├── services/              # API client helpers
├── utilities/             # Shared utils/constants
├── theme/                 # Theme provider and Snack UIKit setup
└── types/                 # Shared TypeScript types
```

## UI/tech stack

- React 19, TypeScript, React Router 7
- Rsbuild for bundling; Snack UIKit for components

## Development notes

- Keep `PUBLIC_API_BASE_URL` pointing at the backend (local: `http://localhost:8000`)
- Use `npm run lint` and `npm run format` before pushing changes
