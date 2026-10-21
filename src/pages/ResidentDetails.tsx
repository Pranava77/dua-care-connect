import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Phone, 
  Home, 
  Heart, 
  FileText, 
  PoundSterling,
  Users,
  Activity,
  MapPin,
  Shield,
  Pill,
  Sparkles
} from "lucide-react";
import { useResidentProfile } from "@/hooks/queries/residentProfile";
import { useAlerts } from "@/hooks/queries/ai";
import { Door } from "@/components/door/Door";
import { floorOf } from "@/lib/doors";
import { residentDoorTransitionName } from "@/hooks/useDoorNavigate";
import { useAssistant } from "@/features/assistant/AssistantProvider";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { toast } from "sonner";
import { EditResidentDialog } from "@/components/EditResidentDialog";
import { PermissionGate } from "@/components/PermissionGate";

export default function ResidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useResidentProfile(id);
  const { resident, medicalRecords, prescriptions, invoices, documents, isLoading: loading, notFound } = profile;
  const fetchResidentData = profile.refetch;
  const { data: alerts = [] } = useAlerts();
  const residentAlerts = alerts.filter((a) => a.resident_id === id);
  const { ask } = useAssistant();
  useDocumentTitle(resident ? `${resident.name}, room ${resident.room_number}` : "Resident");
  const [editingResident, setEditingResident] = useState<any>(null);

  useEffect(() => {
    if (notFound) {
      toast.error("Resident not found");
      navigate("/residents");
    }
  }, [notFound, navigate]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading resident details...</div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Resident not found</p>
          <Button onClick={() => navigate("/residents")}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Link to="/residents" className="arrow-host arrow-back -my-2 inline-flex items-center gap-2 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="arrow h-4 w-4" aria-hidden="true" />
        All residents
      </Link>

      {/* The resident's door: the same door that was clicked in the corridor (shared view transition) */}
      <header className="grid gap-8 md:grid-cols-[auto_1fr] md:items-end">
        <Door
          room={resident.room_number}
          name={resident.name}
          size="xl"
          call={residentAlerts.length > 0}
          style={{ viewTransitionName: residentDoorTransitionName }}
        />
        <div className="space-y-6">
          <div>
            <p className="font-mono text-sm text-muted-foreground tabular">
              Room {resident.room_number} · Floor {floorOf(resident.room_number)}
            </p>
            <h1 className="text-display mt-2">{resident.name}</h1>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Age</dt>
              <dd className="font-bold">{calculateAge(resident.date_of_birth)} years</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Born</dt>
              <dd className="font-mono font-bold tabular">{new Date(resident.date_of_birth).toLocaleDateString("en-GB")}</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-sm text-muted-foreground">Emergency contact</dt>
              <dd className="font-bold">{resident.emergency_contact}</dd>
            </div>
          </dl>
          {resident.medical_conditions.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Medical conditions" role="list">
              {resident.medical_conditions.map((condition: string) => (
                <li key={condition} className="rounded-md border border-foreground/20 bg-card px-2.5 py-1 text-sm font-bold">{condition}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => ask(`Give me a handover summary for ${resident.name} in room ${resident.room_number}.`, `resident id ${resident.id}`)}>
              <Sparkles className="h-4 w-4" />
              Handover summary
            </Button>
            <PermissionGate permission="residents:update">
              <Button variant="ghost" onClick={() => setEditingResident(resident)}>
                <Edit className="h-4 w-4" />
                Edit details
              </Button>
            </PermissionGate>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <PermissionGate permission="medical:read">
          {/* Medical Records Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Medical records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicalRecords.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No medical records available
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{record.diagnosis}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.doctor} • {new Date(record.last_check_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{record.doctor}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{record.treatment}</p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">Note: {record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No active prescriptions
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{prescription.medication}</p>
                          <p className="text-sm text-muted-foreground">
                            {prescription.dosage} • {prescription.frequency}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning">
                          {prescription.frequency}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Prescribed by</p>
                          <p className="font-medium">{prescription.prescribing_doctor}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Refill due</p>
                          <p className="font-medium">{new Date(prescription.refill_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </PermissionGate>
        </div>

        {/* Right Column: billing and documents */}
        <div className="space-y-6">
          <PermissionGate permission="accounting:read">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices</p>
              ) : (
                <div className="space-y-2">
                  {invoices.slice(0, 3).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={invoice.status === "Paid" ? "default" : "secondary"}
                        className={invoice.status === "Paid" ? "bg-success" : ""}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </PermissionGate>
          <PermissionGate permission="documents:read">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents</p>
              ) : (
                <div className="space-y-2">
                  {documents.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </PermissionGate>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingResident && (
        <EditResidentDialog
          resident={editingResident}
          open={!!editingResident}
          onOpenChange={(open) => !open && setEditingResident(null)}
          onSuccess={() => {
            fetchResidentData();
            setEditingResident(null);
          }}
        />
      )}
    </div>
  );
}
