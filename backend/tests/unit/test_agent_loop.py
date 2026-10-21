import pytest

from app.ai.agent.loop import run_agent
from app.ai.agent.registry import Tool, ToolContext, ToolRegistry, ToolResult
from app.ai.schemas import Citation
from app.domain.users.schemas import AuthUser
from tests.fakes.llm import FakeLLM, call, say
from pydantic import BaseModel


class EchoArgs(BaseModel):
    text: str


class _Store:
    def __init__(self):
        self.audits = []

    def audit(self, **kw):
        self.audits.append(kw)


def _ctx(role: str, store) -> ToolContext:
    user = AuthUser(id="u1", email="x@y.z", name="X", role=role, is_active=True)
    return ToolContext(user=user, gateway=None, search=None, docintel=None, reports=None, store=store, session_id="s1")


def _registry() -> ToolRegistry:
    def echo(_ctx, args: EchoArgs) -> ToolResult:
        return ToolResult(content={"echo": args.text}, citations=[Citation(title="t", url="/x", type="note", id="1")])

    secret = Tool("read_invoices", "finance", EchoArgs, echo, permissions=("accounting:read",))
    return ToolRegistry([Tool("echo", "echo text", EchoArgs, echo), secret])


async def _collect(agen):
    return [e async for e in agen]


@pytest.mark.anyio
async def test_loop_runs_tool_then_answers():
    llm = FakeLLM([[call("echo", text="hi")], [say("You said hi.")]])
    store = _Store()
    events = await _collect(run_agent(llm=llm, registry=_registry(), ctx=_ctx("admin", store), system="s",
                                      history=[], user_message="echo hi"))
    types = [e.type for e in events]
    assert types.count("tool_call") == 1 and "tool_result" in types
    assert "".join(e.data["text"] for e in events if e.type == "token") == "You said hi."
    assert events[-1].type == "citations" and events[-1].data["citations"][0]["url"] == "/x"
    assert store.audits[0]["tool"] == "echo" and store.audits[0]["ok"]
    # the tool result is fed back to the model on the second turn
    assert llm.requests[1]["messages"][-1].tool_result == {"echo": "hi"}


@pytest.mark.anyio
async def test_tools_hidden_and_blocked_without_permission():
    llm = FakeLLM([[call("read_invoices", text="x")], [say("Sorry.")]])
    store = _Store()
    events = await _collect(run_agent(llm=llm, registry=_registry(), ctx=_ctx("nurse", store), system="s",
                                      history=[], user_message="show invoices"))
    assert llm.requests[0]["tools"] == ["echo"]  # the model never sees tools the role cannot use
    result = next(e for e in events if e.type == "tool_result")
    assert result.data["ok"] is False and "Permission denied" in result.data["summary"]


@pytest.mark.anyio
async def test_final_step_withholds_tools():
    llm = FakeLLM([[call("echo", text="1")], [call("echo", text="2")], [say("answer")]])
    await _collect(run_agent(llm=llm, registry=_registry(), ctx=_ctx("admin", _Store()), system="s",
                             history=[], user_message="loop", max_steps=3))
    assert llm.requests[2]["tools"] == []


@pytest.fixture
def anyio_backend():
    return "asyncio"
