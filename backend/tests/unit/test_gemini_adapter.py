"""Offline checks of the Gemini adapter's message/tool conversion (no network)."""

import base64

from app.ai.agent.tools import default_registry
from app.ai.schemas import Message, ToolCall
from app.infra.gemini_llm import LOCAL_ID, GeminiLLM


def test_tool_round_trip_preserves_thought_signature():
    signature = base64.b64encode(b"sig").decode()
    messages = [
        Message(role="user", content="Which refills are due?"),
        Message(role="assistant", tool_calls=[
            ToolCall(id="abc", name="list_prescriptions_due", args={"within_days": 7},
                     provider_meta={"thought_signature": signature, "id": "abc"}),
            ToolCall(id=f"{LOCAL_ID}1", name="get_alerts", args={}),
        ]),
        Message(role="tool", tool_call_id="abc", tool_name="list_prescriptions_due", tool_result={"n": 3}),
        Message(role="tool", tool_call_id=f"{LOCAL_ID}1", tool_name="get_alerts", tool_result={"alerts": []}),
    ]
    contents = GeminiLLM._contents(messages)
    assert [c.role for c in contents] == ["user", "model", "user"]
    first_call = contents[1].parts[0]
    assert first_call.function_call.name == "list_prescriptions_due" and first_call.thought_signature == b"sig"
    responses = contents[2].parts
    assert len(responses) == 2  # parallel results answered in one turn
    assert responses[0].function_response.id == "abc" and responses[1].function_response.id is None


def test_every_tool_schema_converts():
    specs = [t.spec() for t in default_registry().available(["system:admin"] + [
        f"{m}:{a}" for m in ("residents", "medical", "documents", "accounting", "hr")
        for a in ("read", "create", "update", "delete")] + ["reports:generate", "dashboard:read"])]
    tools = GeminiLLM._tools(specs)
    names = {d.name for d in tools[0].function_declarations}
    assert {"semantic_search", "record_payment", "draft_report"} <= names
    assert all("title" not in str(d.parameters_json_schema.get("properties", {})) for d in tools[0].function_declarations)
