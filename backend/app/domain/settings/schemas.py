from datetime import datetime

from pydantic import Field, field_validator

from app.domain.dto import DTO, InputDTO


class StoredAiConfig(DTO):
    """AI provider settings saved from the UI. Internal only: carries the decrypted key."""

    api_key: str | None = None
    chat_model: str | None = None
    updated_by: str | None = None
    updated_at: datetime | None = None


class AiSettingsUpdate(InputDTO):
    api_key: str | None = Field(default=None, min_length=20, max_length=200)
    chat_model: str | None = Field(default=None, min_length=3, max_length=80, pattern=r"^[A-Za-z0-9._\-/]+$")

    @field_validator("api_key")
    @classmethod
    def _strip(cls, value: str | None) -> str | None:
        return value.strip() if value else value
