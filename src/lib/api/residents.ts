import type { Resident } from "@/lib/types";
import { api, query } from "./client";

export type ResidentInput = Omit<Resident, "id" | "created_at">;

export const residentsApi = {
  list: (opts: { recent?: number } = {}) => api.get<Resident[]>(`/residents${query(opts)}`),
  get: (id: string) => api.get<Resident>(`/residents/${id}`),
  create: (data: ResidentInput) => api.post<Resident>("/residents", data),
  update: (id: string, data: Partial<ResidentInput>) => api.patch<Resident>(`/residents/${id}`, data),
  remove: (id: string) => api.delete(`/residents/${id}`),
};
