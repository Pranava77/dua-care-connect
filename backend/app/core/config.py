from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    app_name: str = "SilverSync API"
    database_url: str = f"sqlite:///{BACKEND_DIR / 'data' / 'silversync.db'}"
    storage_dir: Path = BACKEND_DIR / "data" / "files"
    chroma_path: Path = BACKEND_DIR / "data" / "chroma"

    jwt_secret: str = "dev-only-insecure-secret-change-me-0000"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 12

    cors_origins: list[str] = ["http://localhost:8080", "http://localhost:5173"]

    gemini_api_key: str | None = None
    gemini_chat_model: str = "gemini-flash-latest"
    gemini_embed_model: str = "gemini-embedding-001"
    embedding_dimensions: int = 768

    agent_max_steps: int = 6
    max_upload_bytes: int = 10 * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
