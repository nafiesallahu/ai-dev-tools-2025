![CI](../../actions/workflows/ci.yml/badge.svg)

# PR Review Assistant

## Live URLs (placeholders)

- Frontend: `https://<your-vercel-app>.vercel.app`
- Backend: `https://<your-render-service>.onrender.com`

## Problem description

Pull request reviews are critical for quality and security, but they’re time-consuming and inconsistent across reviewers and teams. **PR Review Assistant** is a small, reproducible system that takes a **PR title + git diff** and returns a **structured review** (summary, score, findings) via a FastAPI backend and a minimal React + TypeScript UI.

## Features

- **Inputs**: PR title + diff/patch text
- **Outputs**: stable JSON response:
  - **summary**: human-friendly short summary
  - **score**: integer 0–100
  - **findings[]**: severity + message (+ optional suggestion)
- **Current checks** (rule-based, deterministic):
  - **TODO/FIXME markers** → medium severity
  - **debug logging** (`console.log`, `print(`) → low severity
  - **secret-like strings** (e.g. `password`, `secret`, `api_key`) → high severity
- **Frontend UX**:
  - form with title + diff
  - “Review PR” button with loading/error/result states
  - “Health” button that calls `/health` to validate connectivity

## Architecture overview

- **Frontend**: React + TypeScript (Vite) running on `http://localhost:5173`
- **Backend**: FastAPI running on `http://localhost:8000`
- **Communication**:
  - frontend calls **`/api/health`** and **`/api/review`**
  - Vite dev server proxies `/api/*` → backend service
  - frontend base URL is configured via **`VITE_API_BASE_URL`** (Compose sets it to `/api`)

### `/api` proxy (why it exists)

The backend exposes **`/health`** and **`/review`** (no `/api` prefix). In development we keep the frontend calling **`/api/...`** and configure Vite to proxy and rewrite:

- `/api/health` → `/health`
- `/api/review` → `/review`

In production (e.g. Vercel), you typically set `VITE_API_BASE_URL` to the full backend URL (e.g. `https://<your-render-service>.onrender.com`) and do not use the `/api` proxy.

### API contract (Pydantic models)
- `ReviewRequest`: `{ title: str, diff: str }`
- `ReviewResponse`: `{ summary: str, score: int, findings: Finding[] }`
- `Finding`: `{ severity: "low"|"medium"|"high", message: str, suggestion?: str|null }`

## API

- **`GET /health`**
  - Response: `{ "status": "ok" }`
- **`POST /review`**
  - Request: `{ "title": "...", "diff": "..." }`
  - Response: `{ "summary": "...", "score": 0..100, "findings": [...] }`

Interactive docs: `http://localhost:8000/docs`  
OpenAPI JSON: `http://localhost:8000/openapi.json`

## How to run (Docker Compose) — primary path

### Prerequisites
- Docker + Docker Compose
- (Optional for local dev) Node 20+ and Python 3.11+

### Step-by-step (reproducible)
```bash
cd "ai-dev-tools-2025/pr-review-assistant"
docker compose up --build
```

Then open:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## How to run tests

### Backend unit tests
```bash
cd backend
pytest
```

### Backend integration tests (separate)
```bash
cd backend
pytest tests_integration
```

### Frontend tests (Vitest + React Testing Library)
```bash
cd frontend
npm install
npm test
```

### Run backend tests in Docker (recommended for parity)
From repo root:
```bash
docker compose build backend
docker compose run --rm backend pytest
docker compose run --rm backend pytest tests_integration
```

## AI-assisted development (Cursor)

This project was implemented using **Cursor** as an AI-assisted coding environment with a “minimal but clean” workflow:
- **Start with existing backend contract**, keep response shape stable (`summary`, `score`, `findings[]`)
- **Incremental changes** (small diffs, frequent checks)
- **Tests added early** to lock in contract and prevent regressions
- **Reproducibility-first**: Docker Compose as the default run path

### Example prompts used
- “Create a minimal React + TypeScript frontend that calls POST `/review` and shows results.”
- “Add CORS for the frontend origin and keep `/review` response stable.”
- “Add minimal Vitest + React Testing Library tests for the submit flow.”
- “Add integration tests under `backend/tests_integration/` for the full request/response workflow.”

### Rules followed (high level)
- Keep code minimal: **one page + one API module** on the frontend
- Use `fetch()` (no extra HTTP client libraries)
- Prefer explicit request/response models and stable JSON contracts
- Separate **unit** and **integration** tests

## MCP usage (Context7 + Inspector)

Cursor MCP tooling was used to speed up development and reduce guesswork:
- **Context7 MCP**: used to pull up-to-date docs/examples for:
  - FastAPI request/response models and CORS middleware
  - Vite/Vitest configuration patterns
  - React Testing Library idioms (testing user flows)
- **MCP Inspector / servers**:
  - verified available MCP servers and tools inside Cursor
  - used workspace file/terminal tooling to apply edits and validate configuration quickly

If you’re using MCP in Cursor, open the MCP tools panel and ensure Context7 is enabled; then query docs/examples while editing to keep changes consistent with the framework defaults.

## Security note (Context7 API key)

**Do not commit any Context7 API keys**. Configure Cursor locally to read the key from an environment variable:

- `CONTEXT7_API_KEY` (set in your shell, `.env` that is gitignored, or your OS secrets manager)

The repo should contain **no secrets**.