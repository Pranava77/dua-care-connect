"""Admins can bring their own Gemini key from Settings; it is verified, encrypted and applied live."""

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.ai.ports import LLMUnavailableError
from app.container import Container
from app.core.config import Settings
from app.infra.chroma_store import ChromaVectorStore
from app.infra.gemini_llm import UnconfiguredLLM
from app.infra.hashing_embeddings import HashingEmbeddings
from app.main import create_app
from app.scripts.seed import seed
from tests.conftest import PASSWORD, login
from tests.fakes.llm import FakeLLM, say

GOOD_KEY = "AIzaTEST-good-key-000000000000wxyz"


class FakeCloudEmbeddings(HashingEmbeddings):
    name = "fake-cloud-768"


def fake_factory(api_key, chat_model):
    if not api_key:
        return UnconfiguredLLM(), HashingEmbeddings()
    return FakeLLM([[say(f"answered by {chat_model}")]] * 5), FakeCloudEmbeddings()


def fake_validator(api_key, model):
    if "bad" in api_key or model == "no-such-model":
        raise LLMUnavailableError("Could not verify Gemini settings: the API key was rejected.")


def _container(tmp_path: Path) -> Container:
    settings = Settings(
        _env_file=None, database_url=f"sqlite:///{tmp_path / 'settings.db'}", storage_dir=tmp_path / "files",
        chroma_path=tmp_path / "chroma", jwt_secret="test-secret-that-is-at-least-32-bytes", gemini_api_key=None,
    )
    return Container(settings, vector_store=ChromaVectorStore(None, namespace=f"t-{tmp_path.name}"),
                     ai_factory=fake_factory, key_validator=fake_validator, background_events=False)


@pytest.fixture
def setup(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[tuple[TestClient, Container]]:
    monkeypatch.setenv("SEED_PASSWORD", PASSWORD)
    container = _container(tmp_path)
    seed(container, reset=True)
    with TestClient(create_app(container.settings, container)) as client:
        yield client, container


def test_only_admins_manage_ai_settings(setup):
    client, _ = setup
    doctor = login(client, "doctor")
    assert client.get("/api/settings/ai", headers=doctor).status_code == 403
    assert client.put("/api/settings/ai", headers=doctor, json={"api_key": GOOD_KEY}).status_code == 403


def test_invalid_key_is_rejected_and_not_saved(setup):
    client, container = setup
    admin = login(client, "admin")
    res = client.put("/api/settings/ai", headers=admin, json={"api_key": "AIzaTEST-bad-key-00000000000000"})
    assert res.status_code == 400 and "rejected" in res.json()["error"]["message"]
    assert client.get("/api/settings/ai", headers=admin).json()["data"]["has_saved_key"] is False
    assert container.ai_enabled is False


def test_saving_key_enables_ai_live_without_exposing_it(setup):
    client, container = setup
    admin = login(client, "admin")
    assert client.get("/api/ai/status", headers=admin).json()["data"]["enabled"] is False

    res = client.put("/api/settings/ai", headers=admin, json={"api_key": GOOD_KEY, "chat_model": "gemini-test-pro"})
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["enabled"] and data["source"] == "settings" and data["key_hint"] == "…wxyz"
    assert data["chat_model"] == "gemini-test-pro" and data["updated_by"] == "Admin User"
    assert GOOD_KEY not in res.text

    with container.engine.connect() as conn:
        stored = conn.execute(text("SELECT value FROM app_settings WHERE key = 'ai.gemini_api_key'")).scalar_one()
    assert stored != GOOD_KEY and GOOD_KEY not in stored  # encrypted at rest

    # The new embedding model got its own freshly built index, so search keeps working.
    assert container.embeddings.name == "fake-cloud-768"
    hits = client.get("/api/search/semantic", params={"q": "Metformin"}, headers=admin).json()["data"]
    assert hits

    # The agent now uses the new provider, no restart needed.
    chat = client.post("/api/agent/chat", headers=admin, json={"message": "hello"})
    assert "answered by gemini-test-pro" in chat.text


def test_changing_only_the_model_keeps_the_saved_key(setup):
    client, _ = setup
    admin = login(client, "admin")
    client.put("/api/settings/ai", headers=admin, json={"api_key": GOOD_KEY})
    data = client.put("/api/settings/ai", headers=admin, json={"chat_model": "gemini-other"}).json()["data"]
    assert data["has_saved_key"] and data["chat_model"] == "gemini-other"
    assert client.put("/api/settings/ai", headers=admin, json={"chat_model": "no-such-model"}).status_code == 400


def test_removing_key_disables_ai(setup):
    client, container = setup
    admin = login(client, "admin")
    client.put("/api/settings/ai", headers=admin, json={"api_key": GOOD_KEY})
    data = client.delete("/api/settings/ai/key", headers=admin).json()["data"]
    assert data["enabled"] is False and data["has_saved_key"] is False and data["source"] is None
    assert container.embeddings.name == "hashing-512"


def test_saved_key_survives_restart(setup, tmp_path):
    client, container = setup
    client.put("/api/settings/ai", headers=login(client, "admin"), json={"api_key": GOOD_KEY})
    restarted = _container(tmp_path)
    restarted.load_saved_ai_settings()
    assert restarted.ai_enabled and restarted.ai_source == "settings"
