from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.core.security import decrypt_secret, encrypt_secret
from app.domain.settings.repository import SettingsRepository
from app.domain.settings.schemas import AiSettingsUpdate, StoredAiConfig

log = logging.getLogger(__name__)

AI_KEY = "ai.gemini_api_key"
AI_MODEL = "ai.chat_model"


class SettingsService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = SettingsRepository(db)

    def ai_config(self) -> StoredAiConfig:
        key_row, model_row = self.repo.get(AI_KEY), self.repo.get(AI_MODEL)
        api_key = decrypt_secret(key_row.value) if key_row else None
        if key_row and api_key is None:
            log.warning("Stored AI key could not be decrypted (JWT_SECRET changed?); ignoring it")
        latest = max((r for r in (key_row, model_row) if r), key=lambda r: r.updated_at, default=None)
        return StoredAiConfig(
            api_key=api_key,
            chat_model=model_row.value if model_row else None,
            updated_by=latest.updated_by if latest else None,
            updated_at=latest.updated_at if latest else None,
        )

    def save_ai_config(self, data: AiSettingsUpdate, *, updated_by: str) -> StoredAiConfig:
        if data.api_key:
            self.repo.put(AI_KEY, encrypt_secret(data.api_key), updated_by)
        if data.chat_model:
            self.repo.put(AI_MODEL, data.chat_model, updated_by)
        self.db.commit()
        return self.ai_config()

    def clear_ai_key(self) -> StoredAiConfig:
        row = self.repo.get(AI_KEY)
        if row:
            self.repo.delete(row)
            self.db.commit()
        return self.ai_config()
