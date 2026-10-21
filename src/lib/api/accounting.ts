import type { FinancialStats, Invoice, Payment } from "@/lib/types";
import { api, query } from "./client";

export type InvoiceInput = Omit<Invoice, "id" | "created_at" | "resident_name" | "invoice_number"> & {
  invoice_number?: string;
};
export type PaymentInput = Omit<Payment, "id" | "payment_date"> & { payment_date?: string };

export const accountingApi = {
  listInvoices: (opts: { status?: Invoice["status"]; residentId?: string } = {}) =>
    api.get<Invoice[]>(`/invoices${query({ status: opts.status, resident_id: opts.residentId })}`),
  createInvoice: (data: InvoiceInput) => api.post<Invoice>("/invoices", data),
  updateInvoice: (id: string, data: Partial<InvoiceInput>) => api.patch<Invoice>(`/invoices/${id}`, data),
  removeInvoice: (id: string) => api.delete(`/invoices/${id}`),
  listPayments: () => api.get<Payment[]>("/payments"),
  recordPayment: (data: PaymentInput) => api.post<Payment>("/payments", data),
  stats: () => api.get<FinancialStats>("/accounting/stats"),
};
