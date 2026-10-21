import { Link } from "react-router-dom";
import { ArrowRight, FileText, Sparkles, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoorChip } from "@/components/door/DoorChip";
import { useAlerts } from "@/hooks/queries/ai";
import { useAssistant } from "@/features/assistant/AssistantProvider";
import type { AlertItem } from "@/lib/types";

const KIND_LABEL: Record<AlertItem["kind"], string> = {
  refill_due: "Medication",
  invoice_overdue: "Billing",
  leave_pending: "Staff",
  document_pending: "Documents",
};

/** Role-scoped operational alerts as a list, each led by the resident's door, with a hand-off to the assistant. */
export function AiAlertsCard() {
  const { data: alerts = [], isLoading } = useAlerts();
  const { ask } = useAssistant();

  return (
    <section aria-labelledby="needs-attention" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="needs-attention" className="text-headline-2">
          Needs attention <span className="font-mono text-base font-semibold text-muted-foreground tabular">{alerts.length}</span>
        </h2>
        {alerts.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => ask("Summarise today's alerts and suggest what to do first.")}>
            <Sparkles className="h-4 w-4" /> Plan my shift with the assistant
          </Button>
        )}
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Checking the rooms…</p>
      ) : alerts.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-5 text-sm">Every call light is off. Nothing needs you right now.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card" role="list">
          {alerts.slice(0, 8).map((alert, i) => (
            <li key={`${alert.kind}-${i}`}>
              <Link to={alert.url} className="door-row arrow-host group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60">
                <span
                  className={`h-2.5 w-2.5 flex-none rounded-full ${alert.severity === "low" ? "bg-foreground/20" : "bg-call shadow-[0_0_0_3px_hsl(var(--call)/0.25)]"}`}
                  aria-label={alert.severity === "low" ? "Routine" : alert.severity === "high" ? "Urgent" : "Soon"}
                  role="img"
                />
                {alert.resident_id ? (
                  <DoorChip residentId={alert.resident_id} showName={false} className="flex-none" />
                ) : (
                  <span className="grid h-[2.1rem] w-[1.55rem] flex-none place-items-center text-muted-foreground" aria-hidden="true">
                    {alert.kind === "leave_pending" ? <UserCog className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{alert.title}</span>
                  <span className="line-clamp-2 text-sm text-muted-foreground">{alert.detail}</span>
                </span>
                <span className="hidden flex-none font-mono text-xs text-muted-foreground sm:block">{KIND_LABEL[alert.kind]}</span>
                <ArrowRight className="arrow h-4 w-4 flex-none text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
