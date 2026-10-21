import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { agentApi } from "@/lib/api/ai";
import type { ChatMessageRecord, Citation, ProposedAction, ToolStep } from "@/lib/types";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps: ToolStep[];
  citations: Citation[];
  actions: ProposedAction[];
  error?: string;
  streaming?: boolean;
}

const newId = () => Math.random().toString(36).slice(2);

function fromRecord(record: ChatMessageRecord): ChatTurn {
  return {
    id: newId(),
    role: record.role,
    content: record.content,
    steps: record.meta.steps ?? [],
    citations: record.meta.citations ?? [],
    actions: record.meta.actions ?? [],
  };
}

/** Conversation state for the assistant: streams agent events into chat turns. */
export function useAgentChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const updateLast = (update: (turn: ChatTurn) => ChatTurn) =>
    setTurns((prev) => [...prev.slice(0, -1), update(prev[prev.length - 1])]);

  const send = useCallback(async (message: string, pageContext?: string) => {
    const text = message.trim();
    if (!text || busy) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setTurns((prev) => [
      ...prev,
      { id: newId(), role: "user", content: text, steps: [], citations: [], actions: [] },
      { id: newId(), role: "assistant", content: "", steps: [], citations: [], actions: [], streaming: true },
    ]);
    try {
      for await (const event of agentApi.chat({ message: text, session_id: sessionId, page_context: pageContext }, controller.signal)) {
        switch (event.type) {
          case "session":
            setSessionId(event.data.session_id);
            break;
          case "token":
            updateLast((t) => ({ ...t, content: t.content + event.data.text }));
            break;
          case "tool_call":
            updateLast((t) => ({ ...t, steps: [...t.steps, { id: event.data.id, name: event.data.name, args: event.data.args }] }));
            break;
          case "tool_result":
            updateLast((t) => ({
              ...t,
              steps: t.steps.map((s) => (s.id === event.data.id ? { ...s, ok: event.data.ok, summary: event.data.summary } : s)),
            }));
            break;
          case "proposed_action":
            updateLast((t) => ({ ...t, actions: [...t.actions, event.data] }));
            break;
          case "citations":
            updateLast((t) => ({ ...t, citations: event.data.citations }));
            break;
          case "error":
            updateLast((t) => ({ ...t, error: event.data.message }));
            break;
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        updateLast((t) => ({ ...t, error: error instanceof Error ? error.message : "Something went wrong" }));
      }
    } finally {
      updateLast((t) => ({ ...t, streaming: false }));
      setBusy(false);
      abortRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["ai", "sessions"] });
    }
  }, [busy, sessionId, queryClient]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setTurns([]);
    setSessionId(null);
  }, []);

  const load = useCallback(async (id: string) => {
    abortRef.current?.abort();
    const records = await agentApi.messages(id);
    setSessionId(id);
    setTurns(records.map(fromRecord));
  }, []);

  /** Confirms or rejects a proposed change, then refreshes any data it may have touched. */
  const resolveAction = useCallback(async (action: ProposedAction, decision: "confirm" | "reject") => {
    const updated = decision === "confirm" ? await agentApi.confirm(action.id) : await agentApi.reject(action.id);
    setTurns((prev) => prev.map((turn) => ({
      ...turn,
      actions: turn.actions.map((a) => (a.id === updated.id ? updated : a)),
    })));
    if (updated.status === "executed") await queryClient.invalidateQueries();
    return updated;
  }, [queryClient]);

  return { turns, sessionId, busy, send, stop, reset, load, resolveAction };
}
