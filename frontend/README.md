# Kenzy QA Copilot - Frontend MVP v1.1

AI-powered test automation assistant frontend built with React and Snack UIKit.

## Features

- **Manual Test Case Generation**: Generate Allure TestOps as Code test cases from requirements
- **Automated Test Generation**: Generate e2e UI and API tests from test cases and specifications
- **Test Case Optimization**: Analyze coverage, find duplicates, and suggest improvements
- **Test Case Validation**: Validate test cases against Allure standards and AAA pattern

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set `PUBLIC_API_BASE_URL` to your backend API URL (default: http://localhost:8000)

3. Start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Build

Build the app for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Tech Stack

- **React 19** - UI library
- **Snack UIKit** - Component library from Cloud.ru
- **React Router** - Routing
- **TypeScript** - Type safety
- **Rsbuild** - Build tool

## Project Structure

```
src/
├── components/       # Reusable components
│   └── Layout/      # Main layout and navigation
├── pages/           # Page components
│   ├── TestCaseGeneration/  # Test case generation page
│   ├── AutomatedTests/       # Automated test generation page
│   ├── Optimization/         # Test optimization page
│   └── Validation/            # Test validation page
├── services/        # API client
├── theme/           # Theme configuration
└── types/           # TypeScript types
```

## Learn more

- [Snack UIKit](https://github.com/cloud-ru-tech/snack-uikit) - Component library
- [Rsbuild documentation](https://rsbuild.rs) - Build tool
- [React Router](https://reactrouter.com/) - Routing library
