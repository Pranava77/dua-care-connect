import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "@/lib/api/ai";
import { keys, useInvalidate } from "./keys";

export const useAiStatus = () => useQuery({ queryKey: keys.aiStatus, queryFn: aiApi.status, staleTime: 5 * 60_000 });

export const useAlerts = () => useQuery({ queryKey: keys.alerts, queryFn: aiApi.alerts });

export const useReportKinds = (enabled = true) =>
  useQuery({ queryKey: ["ai", "report-kinds"], queryFn: aiApi.reportKinds, enabled, staleTime: Infinity });

export const useDraftReport = () => useMutation({ mutationFn: (kind: string) => aiApi.draftReport(kind) });

export function useAnalyzeDocument() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => aiApi.analyzeDocument(id), onSuccess: () => invalidate(keys.documents) });
}
