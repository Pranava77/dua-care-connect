import { useMutation, useQuery } from "@tanstack/react-query";
import { residentsApi, type ResidentInput } from "@/lib/api/residents";
import { keys, useInvalidate } from "./keys";

export const useResidents = (enabled = true) => useQuery({ queryKey: keys.residents, queryFn: () => residentsApi.list(), enabled });

export const useResident = (id?: string) =>
  useQuery({ queryKey: keys.resident(id ?? ""), queryFn: () => residentsApi.get(id!), enabled: !!id });

export function useCreateResident() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: ResidentInput) => residentsApi.create(data), onSuccess: () => invalidate(keys.residents) });
}

export function useUpdateResident() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ResidentInput> }) => residentsApi.update(id, data),
    onSuccess: () => invalidate(keys.residents),
  });
}

export function useDeleteResident() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => residentsApi.remove(id),
    // Deleting a resident cascades to their medical, billing and document records.
    onSuccess: () => invalidate(keys.residents, ["medical"], keys.invoices, keys.documents),
  });
}
