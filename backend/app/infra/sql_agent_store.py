from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, ForeignKey, String, Text, select
from sqlalchemy.orm import Mapped, Session, mapped_column, sessionmaker

from app.ai.schemas import ChatMessageRecord, ChatSessionSummary, ProposedAction
from app.core.db import Base, UTCDateTime, new_id, utcnow


class ChatSession(Base):
    __tablename__ = "agent_sessions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(String(32), index=True)
    title: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class ChatMessage(Base):
    __tablename__ = "agent_messages"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    session_id: Mapped[str] = mapped_column(ForeignKey("agent_sessions.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    session_id: Mapped[str] = mapped_column(String(32), index=True)
    user_id: Mapped[str] = mapped_column(String(32), index=True)
    tool: Mapped[str] = mapped_column(String(80))
    args: Mapped[dict] = mapped_column(JSON)
    summary: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


class AgentAudit(Base):
    __tablename__ = "agent_audit"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(String(32), index=True)
    session_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    tool: Mapped[str] = mapped_column(String(80))
    args: Mapped[dict] = mapped_column(JSON)
    ok: Mapped[bool] = mapped_column(Boolean)
    summary: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utcnow)


def _action(row: AgentAction) -> ProposedAction:
    return ProposedAction(id=row.id, tool=row.tool, args=row.args, summary=row.summary,
                          status=row.status, result=row.result)


class SqlAgentStore:
    """AgentStore adapter. Uses short-lived sessions so it is safe to call from any thread."""

    def __init__(self, session_factory: sessionmaker[Session]):
        self._sessions = session_factory

    def create_session(self, user_id: str, title: str) -> str:
        with self._sessions() as db:
            row = ChatSession(user_id=user_id, title=title[:200] or "New conversation")
            db.add(row)
            db.commit()
            return row.id

    def session_owner(self, session_id: str) -> str | None:
        with self._sessions() as db:
            row = db.get(ChatSession, session_id)
            return row.user_id if row else None

    def list_sessions(self, user_id: str) -> list[ChatSessionSummary]:
        with self._sessions() as db:
            rows = db.scalars(select(ChatSession).where(ChatSession.user_id == user_id)
                              .order_by(ChatSession.updated_at.desc()).limit(50))
            return [ChatSessionSummary(id=r.id, title=r.title, updated_at=r.updated_at.isoformat()) for r in rows]

    def add_message(self, session_id: str, role: str, content: str, meta: dict[str, Any] | None = None) -> None:
        with self._sessions() as db:
            db.add(ChatMessage(session_id=session_id, role=role, content=content, meta=meta or {}))
            session = db.get(ChatSession, session_id)
            if session:
                session.updated_at = utcnow()
            db.commit()

    def get_messages(self, session_id: str, limit: int = 50) -> list[ChatMessageRecord]:
        with self._sessions() as db:
            rows = list(db.scalars(select(ChatMessage).where(ChatMessage.session_id == session_id)
                                   .order_by(ChatMessage.created_at.desc()).limit(limit)))
            return [ChatMessageRecord(role=r.role, content=r.content, meta=r.meta or {}, created_at=r.created_at.isoformat())
                    for r in reversed(rows)]

    def create_action(self, session_id: str, user_id: str, tool: str, args: dict[str, Any], summary: str) -> ProposedAction:
        with self._sessions() as db:
            row = AgentAction(session_id=session_id, user_id=user_id, tool=tool, args=args, summary=summary)
            db.add(row)
            db.commit()
            return _action(row)

    def get_action(self, action_id: str) -> tuple[ProposedAction, str] | None:
        with self._sessions() as db:
            row = db.get(AgentAction, action_id)
            return (_action(row), row.user_id) if row else None

    def set_action_status(self, action_id: str, status: str, result: dict[str, Any] | None = None) -> ProposedAction:
        with self._sessions() as db:
            row = db.get(AgentAction, action_id)
            row.status = status
            row.result = result
            db.commit()
            return _action(row)

    def audit(self, *, user_id: str, session_id: str | None, tool: str, args: dict[str, Any], ok: bool, summary: str) -> None:
        with self._sessions() as db:
            db.add(AgentAudit(user_id=user_id, session_id=session_id, tool=tool, args=args, ok=ok, summary=summary[:2000]))
            db.commit()
