# PR Review Assistant

## Problem Description
Code reviews are time-consuming and inconsistent across teams.
This project provides an AI-assisted Pull Request review system that analyzes
Git diffs and produces structured feedback.

## Functionality
- Accept Git diff or PR patch
- Generate automated review
- Highlight risks and improvement suggestions
- Suggest test cases
- Store and retrieve reviews

## System Architecture
- Frontend: React (Vite)
- Backend: FastAPI (Python)
- Database: PostgreSQL
- AI Tooling: Cursor + Context7 MCP
- API Contract: OpenAPI
- Containerization: Docker + Docker Compose
- CI/CD: GitHub Actions

## How to Run
```bash
docker compose up --build