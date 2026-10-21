import type { User } from "@/lib/rbac";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";
const SESSION_KEY = "silversync-session";

export interface Session {
  access_token: string;
  user: User;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const sessionStore = {
  get(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },
  set(session: Session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
  },
};

/** Fired when the backend rejects the stored token, so the auth context can sign out. */
export const AUTH_EXPIRED_EVENT = "silversync:auth-expired";

type Body = Record<string, unknown> | unknown[] | FormData | undefined;

export async function rawRequest(path: string, init: { method?: string; body?: Body; signal?: AbortSignal } = {}) {
  const headers: Record<string, string> = {};
  const token = sessionStore.get()?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (init.body instanceof FormData) {
    body = init.body;
  } else if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }
  const response = await fetch(`${BASE_URL}${path}`, { method: init.method ?? "GET", headers, body, signal: init.signal });
  if (!response.ok) {
    let message = response.statusText || "Request failed";
    try {
      const payload = await response.json();
      message = payload?.error?.message ?? payload?.detail ?? message;
    } catch {
      /* non-JSON error body */
    }
    if (response.status === 401 && token) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new ApiError(message, response.status);
  }
  return response;
}

/** JSON request returning the `data` field of the `{ data, error }` envelope. */
export async function request<T>(path: string, init: { method?: string; body?: Body; signal?: AbortSignal } = {}): Promise<T> {
  const response = await rawRequest(path, init);
  const payload = await response.json();
  return payload.data as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: Body) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body: Body) => request<T>(path, { method: "PATCH", body }),
  delete: (path: string) => request<null>(path, { method: "DELETE" }),
};

export function query(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Downloads an authenticated file response (CSV export, document file). */
export async function downloadFile(path: string, fallbackName: string) {
  const response = await rawRequest(path);
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** POST that yields Server-Sent Event payloads (used by the agent chat stream). */
export async function* streamEvents<T>(path: string, body: Body, signal?: AbortSignal): AsyncGenerator<T> {
  const response = await rawRequest(path, { method: "POST", body, signal });
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) >= 0) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = frame.split("\n").filter((l) => l.startsWith("data: ")).map((l) => l.slice(6)).join("\n");
      if (data) yield JSON.parse(data) as T;
    }
  }
}
