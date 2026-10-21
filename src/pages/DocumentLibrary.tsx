import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Download, FileText, MessageSquareText, Search, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DoorChip } from "@/components/door/DoorChip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { UploadDocumentDialog } from "@/components/UploadDocumentDialog";
import { DocSuggestionReview } from "@/features/doc-intel/DocSuggestionReview";
import { useAssistant } from "@/features/assistant/AssistantProvider";
import { useDeleteDocument, useDocumentStats, useDocuments } from "@/hooks/queries/documents";
import { useAiStatus } from "@/hooks/queries/ai";
import { documentsApi } from "@/lib/api/documents";
import type { CareDocument } from "@/lib/types";

const STATUS_STYLE: Record<CareDocument["status"], string> = {
  Verified: "bg-success/10 text-success",
  Active: "bg-primary/10 text-primary",
  Paid: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Rejected: "bg-destructive/10 text-destructive",
};

export default function DocumentLibrary() {
  useDocumentTitle("Documents");
  const [searchTerm, setSearchTerm] = useState("");
  const [toDelete, setToDelete] = useState<CareDocument | null>(null);
  const [reviewing, setReviewing] = useState<CareDocument | null>(null);
  const { data: documents = [], isLoading } = useDocuments();
  const { data: stats } = useDocumentStats();
  const { data: aiStatus } = useAiStatus();
  const deleteDocument = useDeleteDocument();
  const { ask } = useAssistant();

  const term = searchTerm.toLowerCase();
  const filtered = documents.filter((d) =>
    [d.name, d.category, d.resident_name ?? "", d.description ?? ""].some((v) => v.toLowerCase().includes(term)),
  );

  const statCards = [
    { label: "Total documents", value: stats?.totalDocuments ?? 0 },
    { label: "Admission forms", value: stats?.admissionCount ?? 0 },
    { label: "KYC documents", value: stats?.kycCount ?? 0 },
    { label: "Pending verification", value: stats?.pendingCount ?? 0 },
  ];

  const download = async (doc: CareDocument) => {
    try {
      await documentsApi.download(doc);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDocument.mutateAsync(toDelete);
      toast.success("Document deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div>
          <h1 className="text-headline-1">Documents</h1>
          <p className="mt-3 text-muted-foreground">
            Uploaded files are indexed for search and can be summarised or questioned by the assistant.
          </p>
        </div>
        <PermissionGate permission="documents:create">
          <UploadDocumentDialog />
        </PermissionGate>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter documents…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No documents found</TableCell></TableRow>
                ) : (
                  filtered.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.file_type} · {doc.file_size} · by {doc.uploaded_by}
                            </p>
                            {doc.ai_suggestion?.summary && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex gap-1">
                                <Sparkles className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                {doc.ai_suggestion.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
                      <TableCell>{doc.resident_id ? <DoorChip residentId={doc.resident_id} name={doc.resident_name} link /> : <span className="text-muted-foreground">Not linked</span>}</TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_STYLE[doc.status]}>{doc.status}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {aiStatus?.enabled && doc.has_file && (
                            <>
                              <Button variant="ghost" size="icon" title="Ask the assistant about this document"
                                onClick={() => ask(`Summarise "${doc.name}" and list anything that needs action.`,
                                  `document id ${doc.id} ("${doc.name}")`)}>
                                <MessageSquareText className="h-4 w-4" />
                              </Button>
                              <PermissionGate permission="documents:create">
                                <Button variant="ghost" size="icon" title="Re-run AI categorisation" onClick={() => setReviewing(doc)}>
                                  <Sparkles className="h-4 w-4" />
                                </Button>
                              </PermissionGate>
                            </>
                          )}
                          {doc.has_file && (
                            <Button variant="ghost" size="icon" title="Download" onClick={() => download(doc)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <PermissionGate permission="documents:delete">
                            <Button variant="ghost" size="icon" title="Delete" onClick={() => setToDelete(doc)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!reviewing} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>AI categorisation</DialogTitle></DialogHeader>
          {reviewing && <DocSuggestionReview document={reviewing} onDone={() => setReviewing(null)} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              "{toDelete?.name}" and its stored file will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
