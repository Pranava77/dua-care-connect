import { createContext, useCallback, useContext, useState } from "react";

interface AssistantRequest {
  prompt: string;
  /** Extra context sent with the question, e.g. "document 6: Lab Report - Alice Johnson". */
  context?: string;
}

interface AssistantContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  /** Opens the assistant and asks a question on the user's behalf. */
  ask: (prompt: string, context?: string) => void;
  pending: AssistantRequest | null;
  takePending: () => AssistantRequest | null;
}

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState<AssistantRequest | null>(null);

  const ask = useCallback((prompt: string, context?: string) => {
    setPending({ prompt, context });
    setOpen(true);
  }, []);

  const takePending = useCallback(() => {
    const current = pending;
    setPending(null);
    return current;
  }, [pending]);

  return (
    <AssistantContext.Provider value={{ isOpen, setOpen, ask, pending, takePending }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) throw new Error("useAssistant must be used within an AssistantProvider");
  return context;
}
