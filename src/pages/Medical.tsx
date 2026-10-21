import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Pill, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { AddMedicalRecordDialog } from "@/components/AddMedicalRecordDialog";
import { AddPrescriptionDialog } from "@/components/AddPrescriptionDialog";
import { EditMedicalRecordDialog } from "@/components/EditMedicalRecordDialog";
import { EditPrescriptionDialog } from "@/components/EditPrescriptionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useDeleteMedicalRecord,
  useDeletePrescription,
  useMedicalRecords,
  usePrescriptions,
} from "@/hooks/queries/medical";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DoorChip } from "@/components/door/DoorChip";

/** Refill date with a lit call light when it falls within a week (or has passed). */
function RefillDue({ date }: { date: string }) {
  const days = Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  const soon = days <= 7;
  const label = days < 0 ? `overdue by ${-days} ${days === -1 ? "day" : "days"}` : days === 0 ? "due today" : `due in ${days} ${days === 1 ? "day" : "days"}`;
  return (
    <span className="inline-flex items-center gap-1.5">
      {soon && <span className="h-2 w-2 rounded-full bg-call shadow-[0_0_0_3px_hsl(var(--call)/0.25)]" aria-hidden="true" />}
      <span className={soon ? "font-bold text-warning" : undefined}>
        Refill {label} ({new Date(date).toLocaleDateString("en-GB")})
      </span>
    </span>
  );
}

export default function Medical() {
  useDocumentTitle("Medical records");
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false);
  const [deletePrescriptionDialogOpen, setDeletePrescriptionDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingPrescription, setEditingPrescription] = useState<any>(null);
  const { user } = useAuth();

  const records = useMedicalRecords();
  const prescriptionsQuery = usePrescriptions();
  const medicalRecords = records.data ?? [];
  const prescriptions = prescriptionsQuery.data ?? [];
  const loading = records.isLoading || prescriptionsQuery.isLoading;
  const fetchData = () => Promise.all([records.refetch(), prescriptionsQuery.refetch()]);
  const deleteRecord = useDeleteMedicalRecord();
  const deletePrescription = useDeletePrescription();

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    
    try {
      await deleteRecord.mutateAsync(recordToDelete.id);

      toast.success("Medical record deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete medical record: " + error.message);
    } finally {
      setDeleteRecordDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleDeletePrescription = async () => {
    if (!prescriptionToDelete) return;
    
    try {
      await deletePrescription.mutateAsync(prescriptionToDelete.id);

      toast.success("Prescription deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete prescription: " + error.message);
    } finally {
      setDeletePrescriptionDialogOpen(false);
      setPrescriptionToDelete(null);
    }
  };

  const confirmDeleteRecord = (record: any) => {
    setRecordToDelete(record);
    setDeleteRecordDialogOpen(true);
  };

  const confirmDeletePrescription = (prescription: any) => {
    setPrescriptionToDelete(prescription);
    setDeletePrescriptionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div>
          <h1 className="text-headline-1">Medical records</h1>
          <p className="mt-3 text-muted-foreground">Diagnoses, treatments and the medicines each resident takes, with their next refill date.</p>
        </div>
        <div className="flex gap-2">
          <AddPrescriptionDialog onSuccess={fetchData} />
          <AddMedicalRecordDialog onSuccess={fetchData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
              Latest records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-sm text-muted-foreground">Loading...</div>
              ) : medicalRecords.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">No medical alerts</div>
              ) : (
                medicalRecords.map((record) => (
                  <div key={record.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <DoorChip residentId={record.resident_id} name={record.residents?.name} link />
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {record.doctor}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => confirmDeleteRecord(record)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(record.last_check_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Treatment: {record.treatment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" aria-hidden="true" />
              Prescriptions and refills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-sm text-muted-foreground">Loading...</div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">No prescriptions due</div>
              ) : (
                prescriptions.slice(0, 5).map((prescription) => (
                  <div key={prescription.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <DoorChip residentId={prescription.resident_id} name={prescription.residents?.name} link />
                        <p className="text-sm text-muted-foreground">{prescription.medication}, {prescription.dosage}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-warning/10 text-warning">
                          {prescription.frequency}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingPrescription(prescription)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => confirmDeletePrescription(prescription)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <RefillDue date={prescription.refill_date} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Doctor: {prescription.prescribing_doctor}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {editingRecord && (
        <EditMedicalRecordDialog
          record={editingRecord}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
          onSuccess={() => {
            fetchData();
            setEditingRecord(null);
          }}
        />
      )}

      {editingPrescription && (
        <EditPrescriptionDialog
          prescription={editingPrescription}
          open={!!editingPrescription}
          onOpenChange={(open) => !open && setEditingPrescription(null)}
          onSuccess={() => {
            fetchData();
            setEditingPrescription(null);
          }}
        />
      )}

      <AlertDialog open={deleteRecordDialogOpen} onOpenChange={setDeleteRecordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete medical record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medical record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecord}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deletePrescriptionDialogOpen} onOpenChange={setDeletePrescriptionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prescription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prescription? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrescription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
