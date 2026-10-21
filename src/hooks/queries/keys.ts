import { useQueryClient, type QueryKey } from "@tanstack/react-query";

export const keys = {
  residents: ["residents"] as const,
  resident: (id: string) => ["residents", id] as const,
  staff: ["staff"] as const,
  leave: ["leave"] as const,
  medicalRecords: ["medical", "records"] as const,
  prescriptions: ["medical", "prescriptions"] as const,
  documents: ["documents"] as const,
  documentStats: ["documents", "stats"] as const,
  invoices: ["invoices"] as const,
  payments: ["payments"] as const,
  financialStats: ["accounting", "stats"] as const,
  reports: ["reports"] as const,
  dashboard: ["dashboard"] as const,
  ai: ["ai"] as const,
  alerts: ["ai", "alerts"] as const,
  aiStatus: ["ai", "status"] as const,
  chatSessions: ["ai", "sessions"] as const,
  search: ["ai", "search"] as const,
};

/** Returns a callback invalidating the given query families plus derived views (dashboard, alerts, search). */
export function useInvalidate() {
  const client = useQueryClient();
  return (...families: QueryKey[]) =>
    Promise.all(
      [...families, keys.dashboard, keys.alerts, keys.search].map((queryKey) => client.invalidateQueries({ queryKey })),
    );
}
