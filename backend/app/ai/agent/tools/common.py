from __future__ import annotations

from typing import Any

from pydantic import BaseModel

from app.ai.agent.registry import ToolContext, ToolResult
from app.ai.schemas import Citation


def dump(items: list[BaseModel], limit: int = 50) -> list[dict[str, Any]]:
    return [i.model_dump(mode="json") for i in items[:limit]]


def propose(ctx: ToolContext, tool: str, args: BaseModel, summary: str) -> ToolResult:
    action = ctx.store.create_action(ctx.session_id, ctx.user.id, tool, args.model_dump(mode="json"), summary)
    return ToolResult(
        content={"status": "awaiting_user_confirmation", "action_id": action.id, "summary": summary,
                 "note": "Nothing has been changed yet. Tell the user to confirm or reject the action card."},
        action=action,
    )


def cite(title: str, url: str, type_: str, id_: str) -> Citation:
    return Citation(title=title, url=url, type=type_, id=id_)
