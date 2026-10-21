import type { MedicalRecord, Prescription } from "@/lib/types";
import { api, query } from "./client";

export type MedicalRecordInput = Omit<MedicalRecord, "id" | "created_at" | "residents">;
export type PrescriptionInput = Omit<Prescription, "id" | "created_at" | "residents">;

export interface PrescriptionDue {
  prescription: Prescription;
  days_until_refill: number;
  overdue: boolean;
}

export const medicalApi = {
  listRecords: (residentId?: string) => api.get<MedicalRecord[]>(`/medical/records${query({ resident_id: residentId })}`),
  createRecord: (data: MedicalRecordInput) => api.post<MedicalRecord>("/medical/records", data),
  updateRecord: (id: string, data: Partial<MedicalRecordInput>) => api.patch<MedicalRecord>(`/medical/records/${id}`, data),
  removeRecord: (id: string) => api.delete(`/medical/records/${id}`),

  listPrescriptions: (opts: { residentId?: string; recent?: number } = {}) =>
    api.get<Prescription[]>(`/medical/prescriptions${query({ resident_id: opts.residentId, recent: opts.recent })}`),
  prescriptionsDue: (days = 7) => api.get<PrescriptionDue[]>(`/medical/prescriptions/due${query({ days })}`),
  createPrescription: (data: PrescriptionInput) => api.post<Prescription>("/medical/prescriptions", data),
  updatePrescription: (id: string, data: Partial<PrescriptionInput>) =>
    api.patch<Prescription>(`/medical/prescriptions/${id}`, data),
  removePrescription: (id: string) => api.delete(`/medical/prescriptions/${id}`),
};
