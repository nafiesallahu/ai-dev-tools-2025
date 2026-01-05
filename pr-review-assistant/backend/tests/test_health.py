from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

def test_review_empty_findings():
    r = client.post("/review", json={"title": "Update docs", "diff": "+hello"})
    assert r.status_code == 200
    data = r.json()
    assert set(data.keys()) == {"summary", "score", "findings"}
    assert data["findings"] == []
    assert data["score"] == 100

def test_review_detects_todo():
    r = client.post("/review", json={"title": "Change", "diff": "+TODO: fix later"})
    assert r.status_code == 200
    data = r.json()
    assert set(data.keys()) == {"summary", "score", "findings"}
    assert len(data["findings"]) == 1
    assert data["findings"][0]["severity"] == "medium"