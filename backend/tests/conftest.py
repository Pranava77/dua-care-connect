from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.container import Container
from app.core.config import Settings
from app.infra.chroma_store import ChromaVectorStore
from app.infra.hashing_embeddings import HashingEmbeddings
from app.main import create_app
from app.scripts.seed import seed
from tests.fakes.llm import FakeLLM

PASSWORD = "silversync-dev"


@pytest.fixture
def llm() -> FakeLLM:
    return FakeLLM()


@pytest.fixture
def container(tmp_path: Path, llm: FakeLLM, monkeypatch: pytest.MonkeyPatch) -> Iterator[Container]:
    monkeypatch.setenv("SEED_PASSWORD", PASSWORD)
    settings = Settings(
        _env_file=None,
        database_url=f"sqlite:///{tmp_path / 'test.db'}",
        storage_dir=tmp_path / "files",
        chroma_path=tmp_path / "chroma",
        jwt_secret="test-secret-that-is-at-least-32-bytes",
        gemini_api_key=None,
    )
    embeddings = HashingEmbeddings()
    c = Container(
        settings, llm=llm, embeddings=embeddings,
        vector_store=ChromaVectorStore(None, namespace=f"test-{tmp_path.name}"),
        background_events=False,  # index synchronously so tests can assert on it
    )
    seed(c, reset=True)
    yield c
    c.shutdown()


@pytest.fixture
def client(container: Container) -> Iterator[TestClient]:
    with TestClient(create_app(container.settings, container)) as tc:
        yield tc


def login(client: TestClient, role: str) -> dict[str, str]:
    res = client.post("/api/auth/login", json={"email": f"{role}@silversync.com", "password": PASSWORD})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['data']['session']['access_token']}"}


@pytest.fixture
def as_role(client: TestClient):
    cache: dict[str, dict[str, str]] = {}

    def headers(role: str) -> dict[str, str]:
        if role not in cache:
            cache[role] = login(client, role)
        return cache[role]

    return headers
