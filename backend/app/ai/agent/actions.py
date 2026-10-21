"""Human-in-the-loop execution of agent-proposed changes."""

from __future__ import annotations

from app.ai.agent.registry import ToolRegistry
from app.ai.ports import AgentStore
from app.ai.gateway import DomainGateway
from app.ai.schemas import ProposedAction
from app.core.errors import DomainError, NotFoundError, PermissionDeniedError
from app.domain.users.schemas import AuthUser


class ActionService:
    def __init__(self, store: AgentStore, registry: ToolRegistry):
        self.store = store
        self.registry = registry

    def _load(self, action_id: str, user: AuthUser) -> ProposedAction:
        found = self.store.get_action(action_id)
        if found is None:
            raise NotFoundError("Action not found")
        action, owner = found
        if owner != user.id:
            raise PermissionDeniedError("This action belongs to another user")
        if action.status != "pending":
            raise DomainError(f"Action is already {action.status}")
        return action

    def confirm(self, action_id: str, user: AuthUser, gateway: DomainGateway) -> ProposedAction:
        action = self._load(action_id, user)
        tool = self.registry.get(action.tool)
        if tool is None or tool.execute is None:
            raise DomainError("Action cannot be executed")
        if not tool.allowed(user.permissions):  # re-check: the role may have changed since the proposal
            raise PermissionDeniedError("Your role can no longer perform this action")
        try:
            result = tool.execute(gateway, action.args)
        except DomainError as exc:
            self.store.audit(user_id=user.id, session_id=None, tool=f"confirm:{action.tool}", args=action.args,
                             ok=False, summary=exc.message)
            return self.store.set_action_status(action_id, "failed", {"error": exc.message})
        self.store.audit(user_id=user.id, session_id=None, tool=f"confirm:{action.tool}", args=action.args,
                         ok=True, summary=action.summary)
        return self.store.set_action_status(action_id, "executed", result)

    def reject(self, action_id: str, user: AuthUser) -> ProposedAction:
        self._load(action_id, user)
        return self.store.set_action_status(action_id, "rejected")
