import { useMutation, useQuery } from "@tanstack/react-query";
import { documentsApi, type DocumentUploadInput } from "@/lib/api/documents";
import type { CareDocument } from "@/lib/types";
import { keys, useInvalidate } from "./keys";

export const useDocuments = (enabled = true) => useQuery({ queryKey: keys.documents, queryFn: () => documentsApi.list(), enabled });

export const useDocumentStats = (enabled = true) =>
  useQuery({ queryKey: keys.documentStats, queryFn: documentsApi.stats, enabled });

export function useUploadDocument() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: DocumentUploadInput) => documentsApi.upload(input), onSuccess: () => invalidate(keys.documents) });
}

export function useUpdateDocument() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof documentsApi.update>[1] }) => documentsApi.update(id, data),
    onSuccess: () => invalidate(keys.documents),
  });
}

export function useDeleteDocument() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (doc: Pick<CareDocument, "id">) => documentsApi.remove(doc.id), onSuccess: () => invalidate(keys.documents) });
}
