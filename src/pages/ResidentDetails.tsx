import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  DollarSign,
  Users,
  Activity,
  MapPin,
  Shield,
  Pill
} from "lucide-react";
import { mockApi } from "@/lib/mockData";
import { toast } from "sonner";
import { EditResidentDialog } from "@/components/EditResidentDialog";
import { PermissionGate } from "@/components/PermissionGate";

export default function ResidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resident, setResident] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResident, setEditingResident] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchResidentData();
    }
  }, [id]);

  const fetchResidentData = async () => {
    try {
      const [residentRes, medicalRes, prescriptionRes, invoiceRes, documentRes] = await Promise.all([
        mockApi.getResidents(),
        mockApi.getMedicalRecords(),
        mockApi.getPrescriptions(),
        mockApi.getInvoices(),
        mockApi.getDocuments(),
      ]);

      const foundResident = residentRes.data?.find((r: any) => r.id === id);
      if (foundResident) {
        setResident(foundResident);
        
        // Get related data
        setMedicalRecords(medicalRes.data?.filter((m: any) => m.resident_id === id) || []);
        setPrescriptions(prescriptionRes.data?.filter((p: any) => p.resident_id === id) || []);
        setInvoices(invoiceRes.data?.filter((i: any) => i.resident_id === id) || []);
        setDocuments(documentRes.data?.filter((d: any) => d.resident_id === id) || []);
      } else {
        toast.error("Resident not found");
        navigate("/residents");
      }
    } catch (error: any) {
      toast.error("Failed to load resident data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Button onClick={() => navigate("/residents")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/residents")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Residents
          </Button>
          <div>
            <h1 className="text-headline-1 font-bold text-gradient-primary">{resident.name}</h1>
            <p className="text-body text-muted-foreground">Complete resident profile and history</p>
          </div>
        </div>
        <PermissionGate permission="residents:update">
          <Button onClick={() => setEditingResident(resident)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{resident.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="font-semibold">{calculateAge(resident.date_of_birth)} years old</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Home className="h-4 w-4" /> Room Number
                  </p>
                  <p className="font-semibold">{resident.room_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Date of Birth
                  </p>
                  <p className="font-semibold">{new Date(resident.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Emergency Contact
                </p>
                <p className="font-semibold">{resident.emergency_contact}</p>
              </div>

              {resident.medical_conditions && resident.medical_conditions.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4" /> Medical Conditions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resident.medical_conditions.map((condition: string, index: number) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Medical Records Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Medical Records Timeline
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
                        <Badge variant="outline">{record.category || 'Routine'}</Badge>
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
                Current Prescriptions
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
        </div>

        {/* Right Column - Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Medical Records
                </span>
                <Badge variant="secondary">{medicalRecords.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Prescriptions
                </span>
                <Badge variant="secondary">{prescriptions.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Invoices
                </span>
                <Badge variant="secondary">{invoices.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Documents
                </span>
                <Badge variant="secondary">{documents.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Invoices</CardTitle>
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
