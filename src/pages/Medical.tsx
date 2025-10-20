import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Pill } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Medical() {
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [recordsResult, prescriptionsResult] = await Promise.all([
        supabase.from('medical_records').select('*, residents(name)').order('last_check_date', { ascending: false }),
        supabase.from('prescriptions').select('*, residents(name)').order('refill_date', { ascending: true })
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Medical Records</h2>
        <p className="text-muted-foreground">Monitor health conditions and prescriptions</p>
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
                      <div>
                        <p className="font-semibold text-foreground">{record.residents?.name}</p>
                        <p className="text-sm text-muted-foreground">{record.condition}</p>
                      </div>
                      <Badge
                        variant={
                          record.priority === "high"
                            ? "destructive"
                            : record.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {record.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(record.last_check_date).toLocaleDateString()}
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
                      <div>
                        <p className="font-semibold text-foreground">{prescription.residents?.name}</p>
                        <p className="text-sm text-muted-foreground">{prescription.medication} - {prescription.dosage}</p>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning">
                        {prescription.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Refill date: {new Date(prescription.refill_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
