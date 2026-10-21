"""The agent loop: model ↔ tools until the model answers, streaming every step."""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

from app.ai.agent.registry import ToolContext, ToolRegistry, ToolResult
from app.ai.ports import LLMProvider
from app.ai.schemas import AgentEvent, Citation, Message, ToolCall


def _summarize(result: ToolResult) -> str:
    if not result.ok:
        return str(result.content.get("error", "failed"))
    for key, value in result.content.items():
        if isinstance(value, list):
            return f"{len(value)} {key.replace('_', ' ')}"
    return "ok"


async def run_agent(
    *,
    llm: LLMProvider,
    registry: ToolRegistry,
    ctx: ToolContext,
    system: str,
    history: list[Message],
    user_message: str,
    max_steps: int = 6,
) -> AsyncIterator[AgentEvent]:
    messages = [*history, Message(role="user", content=user_message)]
    specs = [t.spec() for t in registry.available(ctx.user.permissions)]
    citations: dict[tuple[str, str], Citation] = {}

    for step in range(1, max_steps + 1):
        final_step = step == max_steps
        yield AgentEvent(type="step", data={"step": step})
        text, calls = "", []
        # On the last step tools are withheld so the model must produce an answer.
        async for chunk in llm.stream(system=system, messages=messages, tools=() if final_step else specs):
            if chunk.text:
                text += chunk.text
                yield AgentEvent(type="token", data={"text": chunk.text})
            calls.extend(chunk.tool_calls)

        if not calls:
            break

        messages.append(Message(role="assistant", content=text, tool_calls=calls))
        for call in calls:
            async for event in _run_tool(registry, ctx, call, citations, messages):
                yield event

    yield AgentEvent(type="citations", data={"citations": [c.model_dump() for c in citations.values()]})


async def _run_tool(registry: ToolRegistry, ctx: ToolContext, call: ToolCall,
                    citations: dict[tuple[str, str], Citation], messages: list[Message]) -> AsyncIterator[AgentEvent]:
    yield AgentEvent(type="tool_call", data={"id": call.id, "name": call.name, "args": call.args})
    result = await registry.run(call.name, call.args, ctx)
    summary = _summarize(result)
    ctx.store.audit(user_id=ctx.user.id, session_id=ctx.session_id, tool=call.name, args=call.args,
                    ok=result.ok, summary=summary)
    for citation in result.citations:
        citations.setdefault((citation.type, citation.id), citation)
    if result.action:
        yield AgentEvent(type="proposed_action", data=result.action.model_dump())
    yield AgentEvent(type="tool_result", data={"id": call.id, "name": call.name, "ok": result.ok, "summary": summary})
    content: dict[str, Any] = result.content
    messages.append(Message(role="tool", tool_call_id=call.id, tool_name=call.name, tool_result=content))
