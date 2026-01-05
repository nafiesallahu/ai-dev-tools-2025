# AGENTS — AI-assisted Development Guide

This repo is built to be **simple, reproducible, and easy to review**. Use this document as the “rules of engagement” when developing with AI assistance (Cursor + MCP).

## Project goals & constraints

- **Goal**: accept a PR title + diff, return a **structured review** (summary, score, findings) and display it in a minimal web UI.
- **Keep it simple**: no database, no auth, no background jobs unless explicitly added later.
- **Reproducible**: the system must run via **Docker Compose** with one command.
- **Stable contract**: `/review` response shape must stay stable: `{summary, score, findings[]}`.
- **Minimal dependencies**: prefer built-ins (`fetch`) and small libraries only when needed (testing is the exception).

## Coding standards

### Frontend (React + TypeScript, Vite)

- **Single-page UI + single API module**
  - UI: `frontend/src/App.tsx`
  - API client: `frontend/src/api.ts`
- **Patterns**
  - Functional components + hooks only
  - Explicit types for API inputs/outputs (align with OpenAPI/Pydantic)
  - Handle **loading**, **error**, and **empty** states
  - Prefer accessible queries and semantics (labels, buttons, `role="alert"`)
- **HTTP**
  - Use `fetch()` (no axios)
  - Base URL comes from `VITE_API_BASE_URL` (Compose sets it)

### Backend (FastAPI)

- **Structure**
  - Keep API in `backend/app/main.py` until complexity justifies splitting modules.
  - Use Pydantic models for **all** request/response bodies.
  - All endpoints should declare `response_model=...` for contract stability.
- **CORS**
  - CORS must allow local frontend origins (e.g. `http://localhost:5173`).
- **Contract-first**
  - Treat OpenAPI as the source of truth (FastAPI generates it from models).
  - When changing any models, update tests to enforce the new contract.

## API-first rule (OpenAPI is the source of truth)

- **Do not** add “hidden” fields or break response shape.
- Validate changes against:
  - `http://localhost:8000/docs`
  - `http://localhost:8000/openapi.json`
- If frontend types drift from backend, **fix the mismatch** (prefer updating frontend types to match backend models).

## Testing rules (unit vs integration)

- **Backend unit tests** live in `backend/tests/`
  - fast, deterministic, isolated
  - validate contract shape for `/health` and `/review`
- **Backend integration tests** live in `backend/tests_integration/`
  - “full request/response flow” using FastAPI `TestClient`
  - realistic payloads, asserts response shape + key behavior
  - no DB required (if DB is added later, integration tests may exercise it)
- **Frontend tests** use **Vitest + React Testing Library**
  - minimal tests that cover submit flow and rendering of summary

## Docker rules (Compose is the default)

- `docker compose up --build` must start **both** services:
  - backend: `http://localhost:8000`
  - frontend: `http://localhost:5173`
- Prefer configuration through environment variables:
  - `VITE_API_BASE_URL=/api` (frontend)
  - backend supports CORS for the frontend origin
- Avoid “works on my machine” steps; if it’s required, it should be documented and/or containerized.

## MCP usage in the workflow

### Context7 (docs + examples)

Use Context7 MCP when:
- you’re unsure about a library API (FastAPI CORS, Vitest config, RTL patterns)
- you need current best-practice snippets

Recommended prompts:
- “Using FastAPI, what is the recommended way to enable CORS for localhost dev origins?”
- “Vitest + Vite config: how do I set `test.environment` to jsdom and add setup files?”
- “React Testing Library: minimal pattern to test a form submit that calls `fetch`.”
- “How should I type a `fetchJson<T>()` helper in TypeScript?”

### MCP Inspector / servers (Cursor)

Use MCP tooling to keep changes safe and incremental:
- **Search** the codebase before editing (identify endpoints, configs, ports)
- **Read files** to understand existing patterns
- **Apply small patches** and keep diffs reviewable
- **Run tests** frequently (backend `pytest`, frontend `npm test`)

## Commit message style

Use conventional-style prefixes:
- `feat:` new functionality
- `fix:` bug fix
- `test:` add/adjust tests
- `docs:` documentation changes
- `refactor:` refactors (no behavior change)
- `chore:` tooling/config

Examples:
```
feat: add health button to frontend
test: add integration test for review workflow
docs: document docker compose run + test commands
fix: stabilize /review response shape
```

## PR checklist

- [ ] `docker compose up --build` works and UI loads
- [ ] Backend endpoints documented in `/docs` and stable JSON responses
- [ ] CORS allows local frontend origin
- [ ] Tests pass:
  - [ ] `cd backend && pytest`
  - [ ] `cd backend && pytest tests_integration`
  - [ ] `cd frontend && npm test`
- [ ] README updated if behavior/config changed (ports, commands, env vars)
- [ ] No secrets committed; diffs and examples use fake keys only
