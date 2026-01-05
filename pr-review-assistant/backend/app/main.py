from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import os

app = FastAPI(title="PR Review Assistant API", version="0.1.0")

def _cors_allow_origins() -> list[str]:
    """
    Comma-separated origins via env:
      CORS_ALLOW_ORIGINS="https://myapp.vercel.app,https://myapp.netlify.app"
    Defaults keep local dev working.
    """
    defaults = ["http://localhost:5173", "http://localhost:3000"]
    raw = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
    if not raw:
        return defaults
    extra = [o.strip() for o in raw.split(",") if o.strip()]
    # stable order + avoid duplicates
    seen: set[str] = set()
    out: list[str] = []
    for origin in defaults + extra:
        if origin not in seen:
            seen.add(origin)
            out.append(origin)
    return out

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str

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