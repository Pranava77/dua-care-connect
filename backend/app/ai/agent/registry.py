"""Tool registry: declares what the agent can do and enforces who may do it."""

from __future__ import annotations

import asyncio
import inspect
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from pydantic import BaseModel, ValidationError

from app.ai.ports import AgentStore
from app.ai.gateway import DomainGateway
from app.ai.schemas import Citation, ProposedAction, ToolSpec
from app.core.errors import DomainError
from app.domain.users.schemas import AuthUser

if TYPE_CHECKING:
    from app.ai.docintel.service import DocIntelService
    from app.ai.reports.service import ReportsService
    from app.ai.search.service import SearchService


@dataclass
class ToolContext:
    user: AuthUser
    gateway: DomainGateway
    search: SearchService
    docintel: DocIntelService
    reports: ReportsService
    store: AgentStore
    session_id: str


@dataclass
class ToolResult:
    content: dict[str, Any]
    citations: list[Citation] = field(default_factory=list)
    action: ProposedAction | None = None
    ok: bool = True

    @classmethod
    def error(cls, message: str) -> ToolResult:
        return cls(content={"error": message}, ok=False)


Handler = Callable[[ToolContext, Any], "ToolResult | Awaitable[ToolResult]"]
Executor = Callable[[DomainGateway, dict[str, Any]], dict[str, Any]]


@dataclass
class Tool:
    name: str
    description: str
    args_model: type[BaseModel]
    handler: Handler
    permissions: tuple[str, ...] = ()
    # Mutating tools only *propose* a change; `execute` runs after the user confirms.
    execute: Executor | None = None

    @property
    def mutating(self) -> bool:
        return self.execute is not None

    def allowed(self, permissions: list[str]) -> bool:
        return all(p in permissions for p in self.permissions)

    def spec(self) -> ToolSpec:
        schema = self.args_model.model_json_schema()
        schema.pop("title", None)
        return ToolSpec(name=self.name, description=self.description, parameters=schema)


class ToolRegistry:
    def __init__(self, tools: list[Tool]):
        self._tools = {t.name: t for t in tools}

    def get(self, name: str) -> Tool | None:
        return self._tools.get(name)

    def available(self, permissions: list[str]) -> list[Tool]:
        """Only tools the user may run are ever shown to the model."""
        return [t for t in self._tools.values() if t.allowed(permissions)]

    async def run(self, name: str, raw_args: dict[str, Any], ctx: ToolContext) -> ToolResult:
        tool = self.get(name)
        if tool is None:
            return ToolResult.error(f"Unknown tool '{name}'")
        if not tool.allowed(ctx.user.permissions):
            return ToolResult.error(f"Permission denied: your role ({ctx.user.role}) cannot use {name}")
        try:
            args = tool.args_model.model_validate(raw_args)
        except ValidationError as exc:
            return ToolResult.error(f"Invalid arguments: {exc.errors(include_url=False)}")
        try:
            if inspect.iscoroutinefunction(tool.handler):
                return await tool.handler(ctx, args)
            return await asyncio.to_thread(tool.handler, ctx, args)
        except DomainError as exc:
            return ToolResult.error(exc.message)
