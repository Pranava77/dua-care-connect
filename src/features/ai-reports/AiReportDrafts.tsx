import { useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Markdown } from "@/components/ai/Markdown";
import { useAuth } from "@/contexts/AuthContext";
import { useAiStatus, useDraftReport, useReportKinds } from "@/hooks/queries/ai";
import type { DraftReport } from "@/lib/types";

/** Lets the user have the AI draft a narrative report from live data, preview it and export a PDF. */
export function AiReportDrafts() {
  const { user } = useAuth();
  const { data: status } = useAiStatus();
  const { data: kinds = [] } = useReportKinds();
  const draft = useDraftReport();
  const [report, setReport] = useState<DraftReport | null>(null);

  const run = async (kind: string) => {
    try {
      setReport(await draft.mutateAsync(kind));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not draft the report");
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI report drafts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Narrative summaries written from current records. Always review before sharing.
        </p>
      </CardHeader>
      <CardContent>
        {status && !status.enabled ? (
          <p className="text-sm text-muted-foreground">AI is not set up yet. An administrator can add a Gemini API key in Settings → AI Provider.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <Button key={k.kind} variant="outline" size="sm" disabled={draft.isPending} onClick={() => run(k.kind)}>
                {draft.isPending && draft.variables === k.kind && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                {k.title}
              </Button>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!report} onOpenChange={(open) => !open && setReport(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{report?.title}</DialogTitle>
            <DialogDescription>AI draft generated {report?.generated_at}. Check figures against the source records.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">{report && <Markdown>{report.markdown}</Markdown>}</div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReport(null)}>Close</Button>
            <Button onClick={async () => {
              if (!report) return;
              // The PDF library loads only when someone exports.
              const { generateMarkdownReport } = await import("@/lib/pdfGenerator");
              generateMarkdownReport(report.title, report.markdown, user?.name ?? "System");
            }}>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
