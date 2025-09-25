from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_programs_endpoint():
    response = client.get("/programs/")
    assert response.status_code == 200
    programs = response.json()
    assert isinstance(programs, list)
    assert programs
    assert programs[0]["id"] == "auburn_mbb"


def test_athletes_endpoint():
    response = client.get("/athletes/")
    assert response.status_code == 200
    athletes = response.json()
    assert isinstance(athletes, list)
    assert athletes
    response = client.get("/athletes/", params={"program_id": "auburn_mbb"})
    assert response.status_code == 200
    filtered = response.json()
    assert all(a["program_id"] == "auburn_mbb" for a in filtered)



def test_scenarios_endpoint():
    response = client.get("/scenarios/")
    assert response.status_code == 200
    scenarios = response.json()
    assert scenarios
    assert scenarios[0]["opponent"]
    response = client.get("/scenarios/", params={"program_id": "auburn_mbb"})
    filtered = response.json()
    assert filtered and all(s["program_id"] == "auburn_mbb" for s in filtered)


def test_agent_ws_stream():
    with client.websocket_connect("/ws/agents") as websocket:
        messages = []
        while True:
            try:
                messages.append(websocket.receive_json())
            except WebSocketDisconnect:
                break
        assert any(msg.get("type") == "evidence" for msg in messages)
        assert any(msg.get("type") == "consensus" for msg in messages)



def test_metrics_endpoint():
    response = client.get("/metrics/")
    assert response.status_code == 200
    data = response.json()
    assert data["valuation_accuracy"] > 0


def test_narrative_endpoint():
    response = client.post("/narratives/story", json={"prompt": "Explain valuation."})
    assert response.status_code == 200
    data = response.json()
    assert "narrative" in data
