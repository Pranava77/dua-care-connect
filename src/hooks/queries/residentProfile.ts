import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { accountingApi } from "@/lib/api/accounting";
import { documentsApi } from "@/lib/api/documents";
import { medicalApi } from "@/lib/api/medical";
import { hasPermission } from "@/lib/rbac";
import { keys } from "./keys";
import { useResident } from "./residents";

/** A resident plus the related records the current user is allowed to see. */
export function useResidentProfile(id?: string) {
  const { user } = useAuth();
  const allowed = (permission: Parameters<typeof hasPermission>[1]) => !!id && hasPermission(user, permission);

  const resident = useResident(id);
  const records = useQuery({
    queryKey: [...keys.medicalRecords, id], queryFn: () => medicalApi.listRecords(id), enabled: allowed("medical:read"),
  });
  const prescriptions = useQuery({
    queryKey: [...keys.prescriptions, id], queryFn: () => medicalApi.listPrescriptions({ residentId: id }),
    enabled: allowed("medical:read"),
  });
  const invoices = useQuery({
    queryKey: [...keys.invoices, id], queryFn: () => accountingApi.listInvoices({ residentId: id }),
    enabled: allowed("accounting:read"),
  });
  const documents = useQuery({
    queryKey: [...keys.documents, id], queryFn: () => documentsApi.list({ residentId: id }), enabled: allowed("documents:read"),
  });

  return {
    resident: resident.data ?? null,
    medicalRecords: records.data ?? [],
    prescriptions: prescriptions.data ?? [],
    invoices: invoices.data ?? [],
    documents: documents.data ?? [],
    isLoading: resident.isLoading,
    notFound: resident.error instanceof ApiError && resident.error.status === 404,
    refetch: () => Promise.all([resident.refetch(), records.refetch(), prescriptions.refetch(), invoices.refetch(), documents.refetch()]),
  };
}
