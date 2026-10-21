import asyncio

from fastapi import APIRouter, Depends

from app.ai.ports import LLMUnavailableError
from app.api.deps import get_container, get_services, require
from app.api.schemas import ok
from app.container import Container, DomainServices
from app.core.errors import DomainError
from app.domain.settings.schemas import AiSettingsUpdate, StoredAiConfig
from app.domain.users.schemas import AuthUser

router = APIRouter(prefix="/settings", tags=["settings"])


def _view(stored: StoredAiConfig, container: Container) -> dict:
    """Never returns the key itself, only whether one is saved and its last four characters."""
    return {
        **container.ai_status(),
        "has_saved_key": stored.api_key is not None,
        "key_hint": f"…{stored.api_key[-4:]}" if stored.api_key else None,
        "env_key_configured": bool(container.settings.gemini_api_key),
        "default_chat_model": container.settings.gemini_chat_model,
        "updated_by": stored.updated_by,
        "updated_at": stored.updated_at.isoformat() if stored.updated_at else None,
    }


@router.get("/ai")
def get_ai_settings(_: AuthUser = Depends(require("system:settings")), services: DomainServices = Depends(get_services),
                    container: Container = Depends(get_container)):
    return ok(_view(services.settings.ai_config(), container))


@router.put("/ai")
async def update_ai_settings(data: AiSettingsUpdate, user: AuthUser = Depends(require("system:settings")),
                             services: DomainServices = Depends(get_services),
                             container: Container = Depends(get_container)):
    if not data.api_key and not data.chat_model:
        raise DomainError("Provide an API key and/or a chat model")
    current = services.settings.ai_config()
    key = data.api_key or current.api_key or container.settings.gemini_api_key
    model = data.chat_model or current.chat_model or container.settings.gemini_chat_model
    if not key:
        raise DomainError("Add an API key before choosing a model")
    # Verify before saving so a typo never disables AI for everyone.
    try:
        await asyncio.to_thread(container.validate_ai_key, key, model)
    except LLMUnavailableError as exc:
        raise DomainError(str(exc)) from exc
    stored = services.settings.save_ai_config(data, updated_by=user.name)
    container.apply_ai_settings(stored)
    return ok(_view(stored, container))


@router.delete("/ai/key")
def remove_ai_key(_: AuthUser = Depends(require("system:settings")), services: DomainServices = Depends(get_services),
                  container: Container = Depends(get_container)):
    stored = services.settings.clear_ai_key()
    container.apply_ai_settings(stored)
    return ok(_view(stored, container))
