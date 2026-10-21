"""Adapter exposing domain services to the AI layer through the DomainGateway port."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.domain.accounting.schemas import FinancialStats, InvoiceRead, OutstandingInvoice, PaymentCreate, PaymentRead
from app.domain.documents.schemas import DocumentFile, DocumentRead, DocumentUpdate
from app.domain.medical.schemas import MedicalRecordCreate, MedicalRecordRead, PrescriptionDue, PrescriptionRead
from app.domain.residents.schemas import ResidentRead
from app.domain.staff.schemas import LeaveRequestRead, LeaveStatus, StaffRead

if TYPE_CHECKING:
    from app.container import DomainServices


class ServiceGateway:
    def __init__(self, services: DomainServices):
        self.s = services

    # Residents
    def list_residents(self) -> list[ResidentRead]:
        return self.s.residents.list()

    def get_resident(self, resident_id: str) -> ResidentRead:
        return self.s.residents.get(resident_id)

    def find_residents(self, name: str) -> list[ResidentRead]:
        return self.s.residents.find_by_name(name)

    # Medical
    def list_medical_records(self, resident_id: str | None = None) -> list[MedicalRecordRead]:
        return self.s.medical.list_records(resident_id)

    def list_prescriptions(self, resident_id: str | None = None) -> list[PrescriptionRead]:
        return self.s.medical.list_prescriptions(resident_id)

    def prescriptions_due(self, within_days: int) -> list[PrescriptionDue]:
        return self.s.medical.prescriptions_due(within_days)

    def create_medical_record(self, data: MedicalRecordCreate) -> MedicalRecordRead:
        return self.s.medical.create_record(data)

    # Accounting
    def list_invoices(self, status: str | None = None, resident_id: str | None = None) -> list[InvoiceRead]:
        return self.s.accounting.list_invoices(status=status, resident_id=resident_id)

    def outstanding_invoices(self) -> list[OutstandingInvoice]:
        return self.s.accounting.outstanding()

    def financial_stats(self) -> FinancialStats:
        return self.s.accounting.stats()

    def get_invoice(self, invoice_id: str) -> InvoiceRead:
        return self.s.accounting.get_invoice(invoice_id)

    def record_payment(self, data: PaymentCreate) -> PaymentRead:
        return self.s.accounting.record_payment(data)

    # HR
    def list_staff(self) -> list[StaffRead]:
        return self.s.staff.list()

    def list_leave_requests(self, status: LeaveStatus | None = None) -> list[LeaveRequestRead]:
        return self.s.staff.list_leave(status)

    def update_leave_status(self, leave_id: str, status: LeaveStatus) -> LeaveRequestRead:
        return self.s.staff.update_leave_status(leave_id, status)

    # Documents
    def list_documents(self, resident_id: str | None = None) -> list[DocumentRead]:
        return self.s.documents.list(resident_id=resident_id)

    def get_document(self, document_id: str) -> DocumentRead:
        return self.s.documents.get(document_id)

    def read_document_file(self, document_id: str) -> DocumentFile:
        return self.s.documents.read_file(document_id)

    def update_document(self, document_id: str, data: DocumentUpdate) -> DocumentRead:
        return self.s.documents.update(document_id, data)
