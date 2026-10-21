import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, ChevronRight, CircleAlert, Loader2, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Citation, ProposedAction, ToolStep } from "@/lib/types";

const TOOL_LABELS: Record<string, string> = {
  semantic_search: "Searched records",
  search_documents: "Searched documents",
  find_resident: "Looked up resident",
  get_resident_profile: "Read resident profile",
  list_prescriptions_due: "Checked refills due",
  list_medical_records: "Read medical records",
  create_medical_record: "Drafted medical record",
  list_invoices: "Read invoices",
  list_outstanding_invoices: "Checked outstanding invoices",
  get_financial_stats: "Read financial stats",
  record_payment: "Drafted payment",
  list_staff: "Read staff list",
  list_leave_requests: "Read leave requests",
  update_leave_status: "Drafted leave decision",
  list_documents: "Listed documents",
  summarize_document: "Read document",
  draft_report: "Drafted report",
  get_alerts: "Checked alerts",
};

export function ToolSteps({ steps }: { steps: ToolStep[] }) {
  const [open, setOpen] = useState(false);
  if (steps.length === 0) return null;
  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <Wrench className="h-3 w-3" />
        {steps.length} {steps.length === 1 ? "step" : "steps"}
      </button>
      {open && (
        <ul className="mt-1.5 space-y-1 border-l border-border pl-3">
          {steps.map((step) => (
            <li key={step.id} className="flex items-center gap-1.5 text-muted-foreground">
              {step.ok === undefined ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : step.ok ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <CircleAlert className="h-3 w-3 text-destructive" />
              )}
              <span className="text-foreground">{TOOL_LABELS[step.name] ?? step.name}</span>
              {step.summary && <span className="truncate">· {step.summary}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Citations({ citations, onNavigate }: { citations: Citation[]; onNavigate?: () => void }) {
  if (citations.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {citations.slice(0, 6).map((c) => (
        <Link key={`${c.type}-${c.id}`} to={c.url} onClick={onNavigate}>
          <Badge variant="outline" className="text-xs font-normal hover:bg-muted cursor-pointer max-w-[220px] truncate">
            {c.title}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

const STATUS_TEXT: Record<ProposedAction["status"], string> = {
  pending: "Awaiting your confirmation",
  executed: "Done",
  rejected: "Rejected",
  failed: "Failed",
};

export function ActionCard({ action, onResolve }: {
  action: ProposedAction;
  onResolve: (action: ProposedAction, decision: "confirm" | "reject") => Promise<ProposedAction>;
}) {
  const [working, setWorking] = useState<"confirm" | "reject" | null>(null);

  const resolve = async (decision: "confirm" | "reject") => {
    setWorking(decision);
    try {
      const updated = await onResolve(action, decision);
      if (updated.status === "executed") toast.success("Change saved");
      if (updated.status === "failed") toast.error(String(updated.result?.error ?? "The change could not be applied"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the action");
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
      <p className="text-sm text-foreground">{action.summary}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{STATUS_TEXT[action.status]}</span>
        {action.status === "pending" && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-7" disabled={!!working} onClick={() => resolve("reject")}>
              {working === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
              Reject
            </Button>
            <Button size="sm" className="h-7" disabled={!!working} onClick={() => resolve("confirm")}>
              {working === "confirm" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
              Confirm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
