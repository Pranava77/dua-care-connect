import type { DashboardSummary, Report } from "@/lib/types";
import { api, downloadFile } from "./client";

export type ExportType = "residents" | "staff" | "invoices" | "documents" | "reports";

export const reportsApi = {
  list: () => api.get<Report[]>("/reports"),
  generate: (id: string) => api.post<Report>(`/reports/${id}/generate`),
  exportCsv: (type: ExportType) => downloadFile(`/export/${type}`, `${type}.csv`),
  dashboard: () => api.get<DashboardSummary>("/dashboard/summary"),
};
