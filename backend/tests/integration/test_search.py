"""Retrieval respects RBAC and stays in sync with domain events."""


def _types(hits):
    return {h["type"] for h in hits}


def test_receptionist_search_never_returns_medical_or_finance(client, as_role):
    hits = client.get("/api/search/semantic", params={"q": "Metformin prescription diabetes invoice", "k": 25},
                      headers=as_role("receptionist")).json()["data"]
    assert hits, "receptionist should still see resident cards"
    assert {h["module"] for h in hits} <= {"residents", "documents"}


def test_doctor_finds_prescription(client, as_role):
    hits = client.get("/api/search/semantic", params={"q": "Metformin 500mg twice daily refill"},
                      headers=as_role("doctor")).json()["data"]
    assert hits[0]["type"] in {"prescription", "medical_record"}
    assert "Metformin" in hits[0]["snippet"]


def test_document_text_is_searchable(client, as_role):
    hits = client.get("/api/search/semantic", params={"q": "HbA1c glucose laboratory results"},
                      headers=as_role("doctor")).json()["data"]
    assert any(h["document_id"] == "6" for h in hits)


def test_index_follows_create_and_delete(client, as_role, container):
    admin = as_role("admin")
    rid = client.post("/api/residents", headers=admin, json={
        "name": "Zebedee Quartermaine", "room_number": "999", "date_of_birth": "1939-09-09",
        "emergency_contact": "n/a", "medical_conditions": [],
    }).json()["data"]["id"]
    found = client.get("/api/search/semantic", params={"q": "Zebedee Quartermaine"}, headers=admin).json()["data"]
    assert found[0]["id"] == rid

    client.delete(f"/api/residents/{rid}", headers=admin)
    after = client.get("/api/search/semantic", params={"q": "Zebedee Quartermaine"}, headers=admin).json()["data"]
    assert rid not in {h["id"] for h in after}
