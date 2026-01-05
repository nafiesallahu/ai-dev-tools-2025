from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_review_workflow_realistic_payload():
    """
    Integration-style test (in-process) that exercises the full request/response
    flow for the /review endpoint using a realistic diff payload.
    """
    payload = {
        "title": "Harden auth flow and remove debug logs",
        "diff": "\n".join(
            [
                "+// TODO: remove this before merge",
                "+console.log('debug')",
                "+const api_key = 'not-a-real-key'",
                "+function safe() { return true }",
            ]
        ),
    }

    r = client.post("/review", json=payload)
    assert r.status_code == 200

    data = r.json()
    assert set(data.keys()) == {"summary", "score", "findings"}
    assert isinstance(data["summary"], str) and data["summary"]
    assert isinstance(data["score"], int)
    assert isinstance(data["findings"], list)

    severities = {f["severity"] for f in data["findings"]}
    assert {"medium", "low", "high"}.issubset(severities)

    # Current scoring rule: 100 - 15 * findings_count (clamped to 0)
    assert data["score"] == max(0, 100 - 15 * len(data["findings"]))


