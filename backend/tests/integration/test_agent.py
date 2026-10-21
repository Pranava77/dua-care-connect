"""Agent conversations over HTTP with a scripted model."""

import json

from tests.fakes.llm import call, say


def _events(response) -> list[dict]:
    return [json.loads(line[6:]) for line in response.text.splitlines() if line.startswith("data: ")]


def test_chat_uses_tools_and_streams_answer(client, as_role, llm):
    llm.turns = [[call("list_prescriptions_due", within_days=30)],
                 [say("Three refills are due this month: Lisinopril, Metformin and Donepezil.")]]
    res = client.post("/api/agent/chat", headers=as_role("doctor"), json={"message": "Which refills are due?"})
    events = _events(res)
    kinds = [e["type"] for e in events]
    assert kinds[0] == "session" and kinds[-1] == "done"
    result = next(e for e in events if e["type"] == "tool_result")
    assert result["data"] == {"id": "call_list_prescriptions_due", "name": "list_prescriptions_due",
                              "ok": True, "summary": "3 prescriptions due"}
    citations = next(e for e in events if e["type"] == "citations")["data"]["citations"]
    assert any(c["url"].startswith("/residents/") for c in citations)

    session_id = events[0]["data"]["session_id"]
    history = client.get(f"/api/agent/sessions/{session_id}/messages", headers=as_role("doctor")).json()["data"]
    assert [m["role"] for m in history] == ["user", "assistant"]
    assert history[1]["content"].startswith("Three refills")


def test_receptionist_agent_cannot_reach_medical_tools(client, as_role, llm):
    llm.turns = [[say("Your role cannot view medical records.")]]
    client.post("/api/agent/chat", headers=as_role("receptionist"), json={"message": "Show Alice's medications"})
    offered = set(llm.requests[0]["tools"])
    assert "list_prescriptions_due" not in offered and "record_payment" not in offered
    assert "find_resident" in offered


def test_write_actions_need_confirmation(client, as_role, llm):
    acct = as_role("accountant")
    llm.turns = [[call("record_payment", invoice_id="3", payment_method="BACS")],
                 [say("I've prepared the payment; please confirm.")]]
    events = _events(client.post("/api/agent/chat", headers=acct, json={"message": "Ethel paid INV-003 by BACS"}))
    action = next(e for e in events if e["type"] == "proposed_action")["data"]
    assert action["status"] == "pending" and "INV-003" in action["summary"]

    invoice = next(i for i in client.get("/api/invoices", headers=acct).json()["data"] if i["id"] == "3")
    assert invoice["status"] == "Overdue", "nothing changes before confirmation"

    other = as_role("admin")
    assert client.post(f"/api/agent/actions/{action['id']}/confirm", headers=other).status_code == 403

    done = client.post(f"/api/agent/actions/{action['id']}/confirm", headers=acct).json()["data"]
    assert done["status"] == "executed"
    invoice = next(i for i in client.get("/api/invoices", headers=acct).json()["data"] if i["id"] == "3")
    assert invoice["status"] == "Paid"
    assert client.post(f"/api/agent/actions/{action['id']}/confirm", headers=acct).status_code == 400


def test_sessions_are_private(client, as_role, llm):
    llm.turns = [[say("hi")]]
    sid = _events(client.post("/api/agent/chat", headers=as_role("doctor"), json={"message": "hello"}))[0]["data"]["session_id"]
    assert client.get(f"/api/agent/sessions/{sid}/messages", headers=as_role("nurse")).status_code == 404


def test_document_analysis_validates_resident(client, as_role, llm):
    llm.structured_result = {"category": "Medical", "resident_id": "1", "summary": "Blood tests.", "confidence": 0.9}
    data = client.post("/api/ai/documents/6/analyze", headers=as_role("doctor")).json()["data"]
    assert data["resident_name"] == "Alice Johnson" and data["category"] == "Medical"

    llm.structured_result = {"category": "Contract", "resident_id": "made-up", "summary": "x", "confidence": 0.4}
    data = client.post("/api/ai/documents/4/analyze", headers=as_role("doctor")).json()["data"]
    assert data["resident_id"] is None


def test_report_drafting_checks_module_permission(client, as_role, llm):
    llm.completion = "# Outstanding & Overdue Invoices\n..."
    ok = client.post("/api/ai/reports/overdue_dues", headers=as_role("accountant"))
    assert ok.status_code == 200 and ok.json()["data"]["markdown"].startswith("# Outstanding")
    assert "INV-003" in llm.requests[-1]["prompt"]
    assert client.post("/api/ai/reports/clinical_summary", headers=as_role("accountant")).status_code == 403


def test_alerts_are_role_scoped(client, as_role):
    doctor = {a["kind"] for a in client.get("/api/ai/alerts", headers=as_role("doctor")).json()["data"]}
    acct = {a["kind"] for a in client.get("/api/ai/alerts", headers=as_role("accountant")).json()["data"]}
    assert "refill_due" in doctor and "invoice_overdue" not in doctor
    assert "invoice_overdue" in acct and "refill_due" not in acct
