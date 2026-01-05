from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Literal

app = FastAPI(title="PR Review Assistant API", version="0.1.0")

@app.get("/health")
def health():
    return {"status": "ok"}

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
def review_pr(payload: ReviewRequest):
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