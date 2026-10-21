import { api } from "./client";

export interface AiSettings {
  enabled: boolean;
  source: "settings" | "environment" | null;
  chat_model: string | null;
  embeddings: string;
  has_saved_key: boolean;
  /** Last four characters only; the key itself is never returned by the API. */
  key_hint: string | null;
  env_key_configured: boolean;
  default_chat_model: string;
  updated_by: string | null;
  updated_at: string | null;
}

export const settingsApi = {
  getAi: () => api.get<AiSettings>("/settings/ai"),
  updateAi: (data: { api_key?: string; chat_model?: string }) => api.request<AiSettings>("/settings/ai", "PUT", data),
  removeAiKey: () => api.request<AiSettings>("/settings/ai/key", "DELETE"),
};
