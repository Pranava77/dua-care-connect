import { useEffect } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalyzeDocument } from "@/hooks/queries/ai";
import { useUpdateDocument } from "@/hooks/queries/documents";
import type { CareDocument } from "@/lib/types";

/** Runs AI analysis on an uploaded document and lets the user apply the suggested category and resident. */
export function DocSuggestionReview({ document, onDone }: { document: CareDocument; onDone: () => void }) {
  const analyze = useAnalyzeDocument();
  const update = useUpdateDocument();

  useEffect(() => {
    analyze.mutate(document.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id]);

  const suggestion = analyze.data;
  const changes = suggestion && {
    category: suggestion.category !== document.category ? suggestion.category : undefined,
    resident_id: suggestion.resident_id && suggestion.resident_id !== document.resident_id ? suggestion.resident_id : undefined,
  };
  const hasChanges = !!changes && (changes.category || changes.resident_id);

  const apply = async () => {
    if (!changes) return;
    try {
      await update.mutateAsync({
        id: document.id,
        data: { ...(changes.category && { category: changes.category }), ...(changes.resident_id && { resident_id: changes.resident_id }) },
      });
      toast.success("Suggestion applied");
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the document");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Check className="h-4 w-4 text-success" />
        <span><span className="font-medium">{document.name}</span> uploaded.</span>
      </div>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-primary" /> AI review
        </div>
        {analyze.isPending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading the document…
          </p>
        )}
        {analyze.isError && <p className="text-sm text-destructive">{(analyze.error as Error).message}</p>}
        {suggestion && (
          <>
            <p className="text-sm">{suggestion.summary}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant={changes?.category ? "default" : "outline"}>Category: {suggestion.category}</Badge>
              <Badge variant={changes?.resident_id ? "default" : "outline"}>
                Resident: {suggestion.resident_name ?? "none identified"}
              </Badge>
              <Badge variant="outline">Confidence {Math.round(suggestion.confidence * 100)}%</Badge>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>{hasChanges ? "Keep my choices" : "Done"}</Button>
        {hasChanges && (
          <Button onClick={apply} disabled={update.isPending}>
            {update.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Apply suggestion
          </Button>
        )}
      </div>
    </div>
  );
}
