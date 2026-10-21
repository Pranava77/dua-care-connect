import type {
  AgentEvent,
  AiStatus,
  AlertItem,
  ChatMessageRecord,
  ChatSessionSummary,
  DocSuggestion,
  DraftReport,
  ProposedAction,
  ReportKindInfo,
  SearchHit,
} from "@/lib/types";
import { api, query, streamEvents } from "./client";

export const aiApi = {
  status: () => api.get<AiStatus>("/ai/status"),
  search: (q: string, k = 8, signal?: AbortSignal) => api.get<SearchHit[]>(`/search/semantic${query({ q, k })}`, signal),
  alerts: () => api.get<AlertItem[]>("/ai/alerts"),
  reportKinds: () => api.get<ReportKindInfo[]>("/ai/reports/kinds"),
  draftReport: (kind: string) => api.post<DraftReport>(`/ai/reports/${kind}`),
  analyzeDocument: (id: string) => api.post<DocSuggestion>(`/ai/documents/${id}/analyze`),
};

export const agentApi = {
  chat: (body: { message: string; session_id?: string | null; page_context?: string }, signal?: AbortSignal) =>
    streamEvents<AgentEvent>("/agent/chat", body, signal),
  sessions: () => api.get<ChatSessionSummary[]>("/agent/sessions"),
  messages: (sessionId: string) => api.get<ChatMessageRecord[]>(`/agent/sessions/${sessionId}/messages`),
  confirm: (actionId: string) => api.post<ProposedAction>(`/agent/actions/${actionId}/confirm`),
  reject: (actionId: string) => api.post<ProposedAction>(`/agent/actions/${actionId}/reject`),
};
