// Data-transfer types shared with the FastAPI backend (backend/app/domain/*/schemas.py).

export interface Resident {
  id: string;
  name: string;
  room_number: string;
  date_of_birth: string;
  emergency_contact: string;
  medical_conditions: string[];
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  salary: number;
  status: "active" | "inactive" | "on_leave";
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  resident_id: string;
  residents: { name: string };
  diagnosis: string;
  treatment: string;
  last_check_date: string;
  doctor: string;
  notes: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  resident_id: string;
  residents: { name: string };
  medication: string;
  dosage: string;
  frequency: string;
  refill_date: string;
  prescribing_doctor: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  staff_id: string;
  staff: { name: string };
  from_date: string;
  to_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export type DocumentCategory = "Admission" | "KYC" | "Consent" | "Contract" | "Financial" | "Medical";

export interface CareDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  file_type: string;
  file_size: string;
  uploaded_by: string;
  resident_id?: string | null;
  resident_name?: string | null;
  status: "Verified" | "Pending" | "Active" | "Paid" | "Rejected";
  uploaded_at: string;
  description?: string | null;
  content_type?: string | null;
  has_file: boolean;
  ai_suggestion?: DocSuggestion | null;
}

export type PaymentMethod = "BACS" | "Card" | "Direct Debit" | "Cash" | "Cheque";

export interface Invoice {
  id: string;
  invoice_number: string;
  resident_id: string;
  resident_name: string;
  amount: number;
  currency: string;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  due_date: string;
  created_at: string;
  paid_at?: string | null;
  payment_method?: PaymentMethod | null;
  services: { name: string; amount: number; description?: string | null }[];
  notes?: string | null;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string | null;
  payment_date: string;
  processed_by: string;
  notes?: string | null;
}

export interface Report {
  id: string;
  name: string;
  category: "Operational" | "Financial" | "Clinical" | "HR";
  type: string;
  period: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  last_generated: string;
  next_scheduled?: string | null;
  status: "Active" | "Inactive" | "Pending";
  file_path?: string | null;
  parameters?: Record<string, unknown> | null;
}

export interface FinancialStats {
  totalRevenue: number;
  outstandingDues: number;
  thisMonthRevenue: number;
  paidToday: number;
  paidTodayCount: number;
}

export interface DocumentStats {
  admissionCount: number;
  kycCount: number;
  pendingCount: number;
  totalDocuments: number;
}

export interface DashboardSummary {
  residents: number;
  medicalCases: number;
  prescriptions: number;
  staff: number;
  recentResidents: Resident[];
  recentPrescriptions: Prescription[];
}

// ---- AI ---------------------------------------------------------------------------

export interface SearchHit {
  id: string;
  type: string;
  title: string;
  snippet: string;
  url: string;
  score: number;
  module: string;
  resident_id?: string | null;
  document_id?: string | null;
}

export interface Citation {
  title: string;
  url: string;
  type: string;
  id: string;
}

export interface DocSuggestion {
  category: DocumentCategory;
  resident_id?: string | null;
  resident_name?: string | null;
  summary: string;
  confidence: number;
}

export interface AlertItem {
  kind: "refill_due" | "invoice_overdue" | "leave_pending" | "document_pending";
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  url: string;
  resident_id?: string | null;
}

export interface AiStatus {
  enabled: boolean;
  chat_model: string | null;
  embeddings: string;
}

export interface ReportKindInfo {
  kind: string;
  title: string;
  permission: string;
}

export interface DraftReport {
  kind: string;
  title: string;
  markdown: string;
  generated_at: string;
}

export interface ProposedAction {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  summary: string;
  status: "pending" | "executed" | "rejected" | "failed";
  result?: Record<string, unknown> | null;
}

export interface ToolStep {
  id: string;
  name: string;
  args?: Record<string, unknown>;
  ok?: boolean;
  summary?: string;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  role: "user" | "assistant";
  content: string;
  meta: { citations?: Citation[]; actions?: ProposedAction[]; steps?: ToolStep[] };
  created_at: string;
}

export type AgentEvent =
  | { type: "session"; data: { session_id: string } }
  | { type: "step"; data: { step: number } }
  | { type: "tool_call"; data: { id: string; name: string; args: Record<string, unknown> } }
  | { type: "tool_result"; data: { id: string; name: string; ok: boolean; summary: string } }
  | { type: "token"; data: { text: string } }
  | { type: "citations"; data: { citations: Citation[] } }
  | { type: "proposed_action"; data: ProposedAction }
  | { type: "error"; data: { message: string } }
  | { type: "done"; data: { session_id: string } };
