import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { History, Loader2, Plus, SendHorizonal, Sparkles, Square } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Markdown } from "@/components/ai/Markdown";
import { useAuth } from "@/contexts/AuthContext";
import { useAiStatus } from "@/hooks/queries/ai";
import { keys } from "@/hooks/queries/keys";
import { agentApi } from "@/lib/api/ai";
import { hasPermission, type User } from "@/lib/rbac";
import { useAssistant } from "./AssistantProvider";
import { ActionCard, Citations, ToolSteps } from "./ChatParts";
import { useAgentChat } from "./useAgentChat";

function suggestionsFor(user: User | null): string[] {
  const items: string[] = [];
  if (hasPermission(user, "medical:read")) items.push("Which prescriptions need a refill this week?");
  if (hasPermission(user, "accounting:read")) items.push("Which invoices are overdue and by how much?");
  if (hasPermission(user, "hr:read")) items.push("Are there any pending leave requests?");
  if (hasPermission(user, "documents:read")) items.push("Summarise Alice Johnson's latest lab report");
  items.push("Give me a quick overview of Room 103");
  return items.slice(0, 4);
}

/** Describes the current page so the agent can resolve "this resident" and similar references. */
function describePage(pathname: string): string {
  const resident = /^\/residents\/([^/]+)/.exec(pathname);
  if (resident) return `the profile page of resident id ${resident[1]}`;
  return `the ${pathname.replace(/^\//, "") || "dashboard"} page`;
}

export function AssistantPanel() {
  const { isOpen, setOpen, pending, takePending } = useAssistant();
  const { user } = useAuth();
  const { data: status } = useAiStatus();
  const { turns, busy, send, stop, reset, load, resolveAction } = useAgentChat();
  const [input, setInput] = useState("");
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => suggestionsFor(user), [user]);
  const { data: sessions = [] } = useQuery({ queryKey: keys.chatSessions, queryFn: agentApi.sessions, enabled: isOpen });

  const submit = (text: string, context?: string) => {
    const page = describePage(location.pathname);
    send(text, context ? `${page}; ${context}` : page);
    setInput("");
  };

  // Questions asked from elsewhere in the app (search bar, document actions).
  useEffect(() => {
    if (isOpen && pending && !busy) {
      const request = takePending();
      if (request) submit(request.prompt, request.context);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pending, busy]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const disabled = status && !status.enabled;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border space-y-1">
          <div className="flex items-center justify-between pr-8">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              SilverSync Assistant
            </SheetTitle>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Conversation history">
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-card z-[60]">
                  <DropdownMenuLabel>Recent conversations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sessions.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No conversations yet</div>
                  ) : (
                    sessions.slice(0, 10).map((s) => (
                      <DropdownMenuItem key={s.id} onClick={() => load(s.id)} className="cursor-pointer">
                        <span className="truncate">{s.title}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={reset} aria-label="New conversation">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="text-xs">
            Answers come from records your role can access. Changes always need your confirmation.
          </SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {disabled && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
              AI is not set up yet. An administrator can add a Gemini API key under{" "}
              <Link to="/settings" className="underline" onClick={() => setOpen(false)}>Settings → AI Provider</Link>.
            </div>
          )}
          {turns.length === 0 && !disabled && (
            <div className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">Ask about residents, medication, billing, staff or documents.</p>
              <div className="grid gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="text-left text-sm rounded-lg border border-border px-3 py-2 hover:bg-muted/60 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {turns.map((turn) =>
            turn.role === "user" ? (
              <div key={turn.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3.5 py-2 text-sm whitespace-pre-wrap">
                  {turn.content}
                </div>
              </div>
            ) : (
              <div key={turn.id} className="space-y-2">
                <ToolSteps steps={turn.steps} />
                {turn.content ? (
                  <Markdown>{turn.content}</Markdown>
                ) : (
                  turn.streaming && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                    </div>
                  )
                )}
                {turn.actions.map((action) => (
                  <ActionCard key={action.id} action={action} onResolve={resolveAction} />
                ))}
                {turn.error && <p className="text-sm text-destructive">{turn.error}</p>}
                <Citations citations={turn.citations} onNavigate={() => setOpen(false)} />
              </div>
            ),
          )}
        </div>

        <form
          className="border-t border-border p-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder={disabled ? "AI is disabled" : "Ask a question…"}
            disabled={disabled}
            rows={1}
            className="min-h-[40px] max-h-32 resize-none"
          />
          {busy ? (
            <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Stop">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim() || disabled} aria-label="Send">
              <SendHorizonal className="h-4 w-4" />
            </Button>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
