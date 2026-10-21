import type { CareDocument, DocumentStats } from "@/lib/types";
import { api, downloadFile, query, rawRequest } from "./client";

export interface DocumentUploadInput {
  file: File;
  name: string;
  category: CareDocument["category"];
  uploaded_by: string;
  resident_id?: string;
  status?: CareDocument["status"];
  description?: string;
}

export const documentsApi = {
  list: (opts: { residentId?: string; category?: string } = {}) =>
    api.get<CareDocument[]>(`/documents${query({ resident_id: opts.residentId, category: opts.category })}`),
  stats: () => api.get<DocumentStats>("/documents/stats"),
  upload: (input: DocumentUploadInput) => {
    const form = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && value !== "") form.append(key, value as string | Blob);
    });
    return api.post<CareDocument>("/documents", form);
  },
  update: (id: string, data: Partial<Pick<CareDocument, "name" | "category" | "resident_id" | "status" | "description">>) =>
    api.patch<CareDocument>(`/documents/${id}`, data),
  remove: (id: string) => api.delete(`/documents/${id}`),
  download: (doc: Pick<CareDocument, "id" | "name">) => downloadFile(`/documents/${doc.id}/file`, doc.name),
  /** Fetches the file as a blob URL for in-browser preview. Caller revokes it. */
  previewUrl: async (id: string) => URL.createObjectURL(await (await rawRequest(`/documents/${id}/file`)).blob()),
};
