"""CRUD parity with the old mockApi plus the RBAC matrix."""

import pytest


def test_login_rejects_bad_password(client):
    res = client.post("/api/auth/login", json={"email": "doctor@silversync.com", "password": "wrong-pass"})
    assert res.status_code == 401
    assert res.json()["error"]["message"] == "Invalid email or password"


def test_me_returns_frontend_user_shape(client, as_role):
    user = client.get("/api/auth/me", headers=as_role("nurse")).json()["data"]
    assert user["role"] == "nurse" and user["isActive"] is True
    assert "medical:read" in user["permissions"]


def test_unauthenticated_requests_are_rejected(client):
    assert client.get("/api/residents").status_code == 401


@pytest.mark.parametrize("role,path,status", [
    ("nurse", "/api/invoices", 403),
    ("receptionist", "/api/medical/records", 403),
    ("receptionist", "/api/staff", 403),
    ("accountant", "/api/medical/prescriptions", 403),
    ("hr", "/api/invoices", 403),
    ("doctor", "/api/medical/records", 200),
    ("accountant", "/api/invoices", 200),
    ("hr", "/api/staff", 200),
])
def test_rbac_matrix(client, as_role, role, path, status):
    assert client.get(path, headers=as_role(role)).status_code == status


def test_resident_crud_and_cascade(client, as_role):
    admin = as_role("admin")
    created = client.post("/api/residents", headers=admin, json={
        "name": "Harold Finch", "room_number": "305", "date_of_birth": "1941-02-03",
        "emergency_contact": "Grace (555) 000-1111", "medical_conditions": ["COPD"],
    })
    assert created.status_code == 201
    rid = created.json()["data"]["id"]
    rx = client.post("/api/medical/prescriptions", headers=admin, json={
        "resident_id": rid, "medication": "Salbutamol", "dosage": "100mcg", "frequency": "As needed",
        "refill_date": "2030-01-01", "prescribing_doctor": "Dr. Sarah Wilson", "residents": {"name": "Harold Finch"},
    })
    assert rx.json()["data"]["residents"] == {"name": "Harold Finch"}

    patched = client.patch(f"/api/residents/{rid}", headers=admin, json={"room_number": "306"})
    assert patched.json()["data"]["room_number"] == "306"

    assert client.delete(f"/api/residents/{rid}", headers=admin).status_code == 200
    remaining = client.get(f"/api/medical/prescriptions?resident_id={rid}", headers=admin).json()
    assert remaining["count"] == 0


def test_record_payment_marks_invoice_paid(client, as_role):
    acct = as_role("accountant")
    res = client.post("/api/payments", headers=acct, json={
        "invoice_id": "2", "amount": 18500, "payment_method": "Card", "processed_by": "Lisa Accounts",
    })
    assert res.status_code == 201
    invoice = next(i for i in client.get("/api/invoices", headers=acct).json()["data"] if i["id"] == "2")
    assert invoice["status"] == "Paid" and invoice["payment_method"] == "Card"
    again = client.post("/api/payments", headers=acct, json={
        "invoice_id": "2", "amount": 10, "payment_method": "Cash", "processed_by": "x"})
    assert again.status_code == 400


def test_prescriptions_due_follows_the_calendar(client, as_role):
    # Seed dates move with today: Lisinopril is due in 5 days, the others later.
    week = client.get("/api/medical/prescriptions/due?days=7", headers=as_role("doctor")).json()["data"]
    assert [d["prescription"]["medication"] for d in week] == ["Lisinopril"]
    assert week[0]["days_until_refill"] == 5 and not week[0]["overdue"]
    month = client.get("/api/medical/prescriptions/due?days=30", headers=as_role("doctor")).json()["data"]
    assert {d["prescription"]["medication"] for d in month} == {"Metformin", "Lisinopril", "Donepezil"}


def test_dashboard_summary_hides_details_from_receptionist(client, as_role):
    summary = client.get("/api/dashboard/summary", headers=as_role("receptionist")).json()["data"]
    assert summary["residents"] == 5 and summary["recentPrescriptions"] == []


def test_document_upload_download_and_stats(client, as_role):
    nurse = as_role("nurse")
    res = client.post("/api/documents", headers=nurse, data={
        "name": "Care plan - Grace Davis", "category": "Medical", "uploaded_by": "Nurse Jennifer Lee", "resident_id": "5",
    }, files={"file": ("care-plan.txt", b"Grace prefers tea at 7am. Hip protector at night.", "text/plain")})
    assert res.status_code == 201, res.text
    doc = res.json()["data"]
    assert doc["file_type"] == "TXT" and doc["resident_name"] == "Grace Davis" and doc["has_file"]
    file = client.get(f"/api/documents/{doc['id']}/file", headers=nurse)
    assert file.content.startswith(b"Grace prefers tea")
    stats = client.get("/api/documents/stats", headers=nurse).json()["data"]
    assert stats["totalDocuments"] == 7


def test_upload_rejects_unsupported_type(client, as_role):
    res = client.post("/api/documents", headers=as_role("nurse"), data={
        "name": "x", "category": "Medical", "uploaded_by": "n"}, files={"file": ("x.exe", b"MZ", "application/x-msdownload")})
    assert res.status_code == 400


def test_export_csv_respects_permissions(client, as_role):
    res = client.get("/api/export/invoices", headers=as_role("accountant"))
    assert res.status_code == 200 and res.text.startswith("id,invoice_number")
    assert client.get("/api/export/invoices", headers=as_role("receptionist")).status_code == 403


def test_uploader_can_fix_own_pending_document_only(client, as_role):
    nurse = as_role("nurse")
    doc = client.post("/api/documents", headers=nurse, data={
        "name": "Scan", "category": "Admission", "uploaded_by": "Nurse Jennifer Lee"},
        files={"file": ("scan.txt", b"Consent for flu vaccine", "text/plain")}).json()["data"]
    assert client.patch(f"/api/documents/{doc['id']}", headers=nurse, json={"category": "Consent"}).status_code == 200
    # someone else's verified document stays read-only for a nurse
    assert client.patch("/api/documents/1", headers=nurse, json={"category": "KYC"}).status_code == 403
