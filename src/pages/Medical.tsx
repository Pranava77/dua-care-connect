import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Pill, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Medical() {
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false);
  const [deletePrescriptionDialogOpen, setDeletePrescriptionDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingPrescription, setEditingPrescription] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [recordsResult, prescriptionsResult] = await Promise.all([
        mockApi.getMedicalRecords(),
        mockApi.getPrescriptions()
      ]);

      if (recordsResult.error) throw recordsResult.error;
      if (prescriptionsResult.error) throw prescriptionsResult.error;

      setMedicalRecords(recordsResult.data || []);
      setPrescriptions(prescriptionsResult.data || []);
    } catch (error: any) {
      toast.error("Failed to load medical data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    
    try {
      const { error } = await mockApi.deleteMedicalRecord(recordToDelete.id);
      if (error) throw error;
      
      toast.success("Medical record deleted successfully");
      fetchData();
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
      const { error } = await mockApi.deletePrescription(prescriptionToDelete.id);
      if (error) throw error;
      
      toast.success("Prescription deleted successfully");
      fetchData();
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-1 font-bold text-foreground">Medical Records</h2>
          <p className="text-body text-muted-foreground">Monitor health conditions and prescriptions</p>
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
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Medical Alerts
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
                        <p className="font-semibold text-foreground">{record.residents?.name}</p>
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {record.doctor}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
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
              <Pill className="h-5 w-5 text-secondary" />
              Prescription Refills
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
                        <p className="font-semibold text-foreground">{prescription.residents?.name}</p>
                        <p className="text-sm text-muted-foreground">{prescription.medication} - {prescription.dosage}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-warning/10 text-warning">
                          {prescription.frequency}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
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
                      Refill date: {new Date(prescription.refill_date).toLocaleDateString()}
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
            <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
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
            <AlertDialogTitle>Delete Prescription</AlertDialogTitle>
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
