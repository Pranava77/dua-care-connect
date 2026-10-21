import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Resident } from "@/lib/types";
import { residentsApi, type ResidentInput } from "@/lib/api/residents";
import { keys, useInvalidate } from "./keys";

export const useResidents = (enabled = true) => useQuery({ queryKey: keys.residents, queryFn: () => residentsApi.list(), enabled });

export function useResident(id?: string) {
  const client = useQueryClient();
  return useQuery({
    queryKey: keys.resident(id ?? ""),
    queryFn: () => residentsApi.get(id!),
    enabled: !!id,
    // Render at once from the residents list when we have it, so the door transition has a target.
    placeholderData: () => client.getQueryData<Resident[]>(keys.residents)?.find((r) => r.id === id),
  });
}

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
