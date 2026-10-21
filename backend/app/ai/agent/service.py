"""Application service for assistant conversations."""

from __future__ import annotations

from collections.abc import AsyncIterator

from app.ai.agent.loop import run_agent
from app.ai.agent.prompts import system_prompt
from app.ai.agent.registry import ToolContext, ToolRegistry
from app.ai.docintel.service import DocIntelService
from app.ai.ports import AgentStore, LLMProvider, LLMUnavailableError
from app.ai.gateway import DomainGateway
from app.ai.reports.service import ReportsService
from app.ai.schemas import AgentEvent, ChatMessageRecord, ChatSessionSummary, Message
from app.ai.search.service import SearchService
from app.core.errors import NotFoundError
from app.domain.users.schemas import AuthUser

HISTORY_TURNS = 20


class AgentService:
    def __init__(self, *, llm: LLMProvider, registry: ToolRegistry, store: AgentStore, search: SearchService,
                 docintel: DocIntelService, reports: ReportsService, max_steps: int = 6):
        self.llm = llm
        self.registry = registry
        self.store = store
        self.search = search
        self.docintel = docintel
        self.reports = reports
        self.max_steps = max_steps

    def _owned_session(self, session_id: str, user: AuthUser) -> str:
        if self.store.session_owner(session_id) != user.id:
            raise NotFoundError("Conversation not found")
        return session_id

    def list_sessions(self, user: AuthUser) -> list[ChatSessionSummary]:
        return self.store.list_sessions(user.id)

    def get_messages(self, session_id: str, user: AuthUser) -> list[ChatMessageRecord]:
        return self.store.get_messages(self._owned_session(session_id, user))

    async def chat(self, *, user: AuthUser, gateway: DomainGateway, message: str,
                   session_id: str | None = None, page_context: str | None = None) -> AsyncIterator[AgentEvent]:
        session_id = self._owned_session(session_id, user) if session_id else \
            self.store.create_session(user.id, message[:80])
        yield AgentEvent(type="session", data={"session_id": session_id})

        history = [Message(role=m.role, content=m.content)
                   for m in self.store.get_messages(session_id, HISTORY_TURNS) if m.content]
        self.store.add_message(session_id, "user", message)

        ctx = ToolContext(user=user, gateway=gateway, search=self.search, docintel=self.docintel,
                          reports=self.reports, store=self.store, session_id=session_id)
        answer, citations, actions, steps = "", [], [], []
        try:
            async for event in run_agent(llm=self.llm, registry=self.registry, ctx=ctx,
                                         system=system_prompt(user, page_context), history=history,
                                         user_message=message, max_steps=self.max_steps):
                if event.type == "token":
                    answer += event.data["text"]
                elif event.type == "citations":
                    citations = event.data["citations"]
                elif event.type == "proposed_action":
                    actions.append(event.data)
                elif event.type == "tool_result":
                    steps.append(event.data)
                yield event
        except LLMUnavailableError as exc:
            answer = answer or str(exc)
            yield AgentEvent(type="error", data={"message": str(exc)})

        self.store.add_message(session_id, "assistant", answer,
                               {"citations": citations, "actions": actions, "steps": steps})
        yield AgentEvent(type="done", data={"session_id": session_id})
