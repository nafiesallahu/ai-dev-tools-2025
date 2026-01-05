from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import os

app = FastAPI(title="PR Review Assistant API", version="0.1.0")

def _cors_allow_origins() -> list[str]:
    """
    Production: set FRONTEND_ORIGIN to your deployed frontend URL (e.g. Vercel).
    Local dev: allow localhost origins if FRONTEND_ORIGIN is not set.
    """
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
    if frontend_origin:
        # Allow a single origin (or a comma-separated list, if provided)
        origins = [o.strip() for o in frontend_origin.split(",") if o.strip()]
        return origins

    # Local dev defaults
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str

@app.get("/")
def root():
    return {"message": "PR Review Assistant API. See /docs for OpenAPI."}

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")

Severity = Literal["low", "medium", "high"]

class ReviewRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    diff: str = Field(min_length=1)

class Finding(BaseModel):
    severity: Severity
    message: str
    suggestion: str | None = None

class ReviewResponse(BaseModel):
    summary: str
    findings: List[Finding]
    score: int

@app.post("/review", response_model=ReviewResponse)
def review_pr(payload: ReviewRequest) -> ReviewResponse:
    diff = payload.diff
    findings: List[Finding] = []

    if "TODO" in diff or "FIXME" in diff:
        findings.append(Finding(
            severity="medium",
            message="Diff contains TODO/FIXME markers.",
            suggestion="Resolve TODO/FIXME or reference a tracked issue."
        ))

    if "console.log" in diff or "print(" in diff:
        findings.append(Finding(
            severity="low",
            message="Debug logging detected.",
            suggestion="Remove debug logs or replace with structured logging."
        ))

    if "+password" in diff.lower() or "+secret" in diff.lower() or "api_key" in diff.lower():
        findings.append(Finding(
            severity="high",
            message="Potential secret-like string detected in diff.",
            suggestion="Remove it and rotate credentials if it was real."
        ))

    score = max(0, 100 - len(findings) * 15)
    summary = "No major issues detected." if not findings else f"Found {len(findings)} potential issue(s)."

    return ReviewResponse(summary=summary, findings=findings, score=score)