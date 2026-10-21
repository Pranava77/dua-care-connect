import { Link } from "react-router-dom";
import { AlertTriangle, BellRing, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/hooks/queries/ai";
import { useAssistant } from "@/features/assistant/AssistantProvider";
import type { AlertItem } from "@/lib/types";

const SEVERITY_STYLE: Record<AlertItem["severity"], string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground",
};

/** Role-scoped operational alerts (refills, overdue invoices, pending approvals) with a hand-off to the assistant. */
export function AiAlertsCard() {
  const { data: alerts = [], isLoading } = useAlerts();
  const { ask } = useAssistant();

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="h-5 w-5 text-primary" />
          Needs attention
          {alerts.length > 0 && <Badge variant="secondary">{alerts.length}</Badge>}
        </CardTitle>
        {alerts.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => ask("Summarise today's alerts and suggest what to prioritise.")}>
            <Sparkles className="h-4 w-4 text-primary" /> Prioritise with AI
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Checking…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing needs attention right now.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {alerts.slice(0, 6).map((alert, i) => (
              <Link key={`${alert.kind}-${i}`} to={alert.url}
                className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${alert.severity === "high" ? "text-destructive" : "text-warning"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <Badge variant="outline" className={`text-[10px] ${SEVERITY_STYLE[alert.severity]}`}>{alert.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{alert.detail}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
