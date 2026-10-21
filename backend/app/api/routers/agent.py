import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.adapters.domain_gateway import ServiceGateway
from app.api.deps import current_user, get_container, get_gateway
from app.api.schemas import ok
from app.container import Container
from app.core.errors import DomainError
from app.domain.users.schemas import AuthUser

router = APIRouter(prefix="/agent", tags=["ai"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None
    page_context: str | None = Field(default=None, max_length=500)


@router.post("/chat")
async def chat(body: ChatRequest, user: AuthUser = Depends(current_user), container: Container = Depends(get_container)):
    """Streams agent events as Server-Sent Events (`data: {"type": ..., "data": {...}}`)."""
    if body.session_id:
        container.agent.get_messages(body.session_id, user)  # ownership check before streaming starts

    async def events() -> AsyncIterator[str]:
        # The request-scoped DB session is closed before streaming begins, so the stream owns its own.
        with container.session_factory() as db:
            gateway = container.gateway(db)
            try:
                async for event in container.agent.chat(user=user, gateway=gateway, message=body.message,
                                                        session_id=body.session_id, page_context=body.page_context):
                    yield f"data: {event.model_dump_json()}\n\n"
            except DomainError as exc:
                yield f"data: {json.dumps({'type': 'error', 'data': {'message': exc.message}})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.get("/sessions")
def sessions(user: AuthUser = Depends(current_user), container: Container = Depends(get_container)):
    return ok([s.model_dump() for s in container.agent.list_sessions(user)], count=True)


@router.get("/sessions/{session_id}/messages")
def session_messages(session_id: str, user: AuthUser = Depends(current_user),
                     container: Container = Depends(get_container)):
    return ok([m.model_dump() for m in container.agent.get_messages(session_id, user)], count=True)


@router.post("/actions/{action_id}/confirm")
def confirm_action(action_id: str, user: AuthUser = Depends(current_user), container: Container = Depends(get_container),
                   gateway: ServiceGateway = Depends(get_gateway)):
    return ok(container.actions.confirm(action_id, user, gateway).model_dump())


@router.post("/actions/{action_id}/reject")
def reject_action(action_id: str, user: AuthUser = Depends(current_user), container: Container = Depends(get_container)):
    return ok(container.actions.reject(action_id, user).model_dump())
