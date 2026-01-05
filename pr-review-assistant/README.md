[![CI](https://github.com/nafiesallahu/ai-dev-tools-2025/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/nafiesallahu/ai-dev-tools-2025/actions/workflows/ci.yml?query=branch%3Amain)

# PR Review Assistant

## Live Deployment

**Production URLs**

- Frontend (Vercel): `https://ai-dev-tools-2025.vercel.app`
- Backend (Render): `https://ai-dev-tools-2025.onrender.com`

**Architecture**

- Frontend is deployed on **Vercel** as a static Vite build.
- Backend is deployed on **Render** as a Dockerized FastAPI service.
- Frontend communicates with the backend over HTTPS using `VITE_API_BASE_URL`.

**Production environment variables**

- Backend (Render):
  - `PORT` (provided by Render)
  - `FRONTEND_ORIGIN=https://ai-dev-tools-2025.vercel.app`
- Frontend (Vercel):
  - `VITE_API_BASE_URL=https://ai-dev-tools-2025.onrender.com`

### Verification

```bash
curl https://ai-dev-tools-2025.onrender.com/health
```

Expected response:
- `{"status":"ok"}`

**Notes**

- Deployments use free tiers: **Render Free** + **Vercel Hobby**
- Backend cold starts may occur on Render free tier (first request can be slow)

For full deployment steps, see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Problem description

Pull request reviews are critical for quality and security, but they’re time-consuming and inconsistent across reviewers and teams. **PR Review Assistant** is a small, reproducible system that takes a **PR title + git diff** and returns a **structured review** (summary, score, findings) via a FastAPI backend and a minimal React + TypeScript UI.

**Statefulness / database**

This project is intentionally **stateless** and **does not use a database**.

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

In production (e.g. Vercel), set `VITE_API_BASE_URL` to the full backend URL (for this repo: `https://ai-dev-tools-2025.onrender.com`) and do not use the `/api` proxy.

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

This project was built with Cursor as an AI-assisted workflow to keep changes small, consistent, and reproducible.

### MCP usage in practice

MCP tools in Cursor (notably **Context7**) were used to pull framework guidance (FastAPI CORS, Vite/Vitest config, React Testing Library patterns) to keep implementation consistent with the intended architecture.

For development rules and recommended prompts, see [`AGENTS.md`](./AGENTS.md).

## Troubleshooting

- **Health shows “Not Found”**: the frontend calls `/api/health`; ensure Vite proxy is enabled and rewrites `/api/*` → backend (`docker compose up --build`).
- **Failed to fetch / network error**: backend may be down or `VITE_API_BASE_URL` is wrong (production should be the full Render URL).
- **CORS errors in browser console**: set backend `FRONTEND_ORIGIN` to your deployed Vercel URL.
- **Render cold start**: free-tier Render services can sleep; first request may take longer.

## CI/CD note

CI runs automated tests (backend unit + integration, and frontend tests) on every push and pull request. On successful pushes to `main`, the frontend and backend are automatically deployed via Vercel and Render Git integrations.