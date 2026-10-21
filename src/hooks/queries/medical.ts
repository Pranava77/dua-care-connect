import { useMutation, useQuery } from "@tanstack/react-query";
import { medicalApi, type MedicalRecordInput, type PrescriptionInput } from "@/lib/api/medical";
import { keys, useInvalidate } from "./keys";

export const useMedicalRecords = (enabled = true) =>
  useQuery({ queryKey: keys.medicalRecords, queryFn: () => medicalApi.listRecords(), enabled });

export const usePrescriptions = (enabled = true) =>
  useQuery({ queryKey: keys.prescriptions, queryFn: () => medicalApi.listPrescriptions(), enabled });

export function useCreateMedicalRecord() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: MedicalRecordInput) => medicalApi.createRecord(data), onSuccess: () => invalidate(keys.medicalRecords) });
}

export function useUpdateMedicalRecord() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicalRecordInput> }) => medicalApi.updateRecord(id, data),
    onSuccess: () => invalidate(keys.medicalRecords),
  });
}

export function useDeleteMedicalRecord() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => medicalApi.removeRecord(id), onSuccess: () => invalidate(keys.medicalRecords) });
}

export function useCreatePrescription() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: PrescriptionInput) => medicalApi.createPrescription(data), onSuccess: () => invalidate(keys.prescriptions) });
}

export function useUpdatePrescription() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PrescriptionInput> }) => medicalApi.updatePrescription(id, data),
    onSuccess: () => invalidate(keys.prescriptions),
  });
}

export function useDeletePrescription() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => medicalApi.removePrescription(id), onSuccess: () => invalidate(keys.prescriptions) });
}
