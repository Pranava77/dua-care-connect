import { useMutation, useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import { keys, useInvalidate } from "./keys";

export const useReports = (enabled = true) => useQuery({ queryKey: keys.reports, queryFn: reportsApi.list, enabled });

export const useDashboardSummary = () => useQuery({ queryKey: keys.dashboard, queryFn: reportsApi.dashboard });

export function useGenerateReport() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => reportsApi.generate(id), onSuccess: () => invalidate(keys.reports) });
}
