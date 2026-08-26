import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.core.config import get_settings
from app.core.admin_auth import require_admin


ADMIN_KEY = "test-admin-key"


def _override_require_admin(x_admin_key: str = ""):
    # Bypass the header dependency directly so tests don't depend on env vars;
    # we instead assert the header check works in its own dedicated test below.
    return None


@pytest.fixture()
def client(tmp_path):
    db_path = tmp_path / "test_admin.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_admin] = _override_require_admin

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


def test_create_list_and_get_question(client):
    create_resp = client.post(
        "/admin/questions",
        json={
            "question_text": "What is a hash map?",
            "expected_answer": "A structure mapping keys to values via a hash function.",
            "topic": "Data Structures",
            "difficulty": "medium",
            "required_concepts": ["key-value", "hash function"],
        },
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["question_text"] == "What is a hash map?"
    assert created["required_concepts"] == ["key-value", "hash function"]
    assert created["id"]  # auto-generated

    list_resp = client.get("/admin/questions")
    assert list_resp.status_code == 200
    assert any(q["id"] == created["id"] for q in list_resp.json())

    get_resp = client.get(f"/admin/questions/{created['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["expected_answer"] == created["expected_answer"]


def test_create_with_duplicate_id_rejected(client):
    payload = {
        "id": "q_dup",
        "question_text": "Q1",
        "expected_answer": "A1",
    }
    first = client.post("/admin/questions", json=payload)
    assert first.status_code == 201

    second = client.post("/admin/questions", json=payload)
    assert second.status_code == 400


def test_update_question_partial_fields(client):
    created = client.post(
        "/admin/questions",
        json={"question_text": "Original", "expected_answer": "Original answer"},
    ).json()

    update_resp = client.put(
        f"/admin/questions/{created['id']}",
        json={"question_text": "Updated question text"},
    )
    assert update_resp.status_code == 200
    body = update_resp.json()
    assert body["question_text"] == "Updated question text"
    assert body["expected_answer"] == "Original answer"  # untouched


def test_delete_question(client):
    created = client.post(
        "/admin/questions",
        json={"question_text": "Temp", "expected_answer": "Temp answer"},
    ).json()

    delete_resp = client.delete(f"/admin/questions/{created['id']}")
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/admin/questions/{created['id']}")
    assert get_resp.status_code == 404


def test_reorder_questions(client):
    q1 = client.post("/admin/questions", json={"question_text": "Q1", "expected_answer": "A1"}).json()
    q2 = client.post("/admin/questions", json={"question_text": "Q2", "expected_answer": "A2"}).json()

    reordered = client.post(
        "/admin/questions/reorder", json={"ordered_ids": [q2["id"], q1["id"]]}
    ).json()

    assert [q["id"] for q in reordered] == [q2["id"], q1["id"]]


def test_admin_routes_reject_missing_key_when_override_removed(tmp_path, monkeypatch):
    """Separate client, without the require_admin override, to verify the
    real auth dependency actually rejects requests missing a valid key."""
    db_path = tmp_path / "test_admin_auth.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    get_settings.cache_clear()
    monkeypatch.setenv("ADMIN_API_KEY", ADMIN_KEY)
    get_settings.cache_clear()

    with TestClient(app) as c:
        no_key_resp = c.get("/admin/questions")
        assert no_key_resp.status_code == 401

        good_key_resp = c.get("/admin/questions", headers={"X-Admin-Key": ADMIN_KEY})
        assert good_key_resp.status_code == 200

    app.dependency_overrides.clear()
    monkeypatch.delenv("ADMIN_API_KEY", raising=False)
    get_settings.cache_clear()