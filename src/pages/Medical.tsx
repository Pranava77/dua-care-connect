import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Heart, Pill, FileText } from "lucide-react";

export default function Medical() {
  const medicalAlerts = [
    { id: 1, resident: "Suresh Reddy", condition: "Hypertension", priority: "high", lastCheck: "2 days ago" },
    { id: 2, resident: "Rajesh Kumar", condition: "Diabetes", priority: "medium", lastCheck: "5 days ago" },
    { id: 3, resident: "Lakshmi Iyer", condition: "Arthritis", priority: "low", lastCheck: "1 week ago" },
  ];

  const prescriptions = [
    { id: 1, resident: "Meena Patel", medication: "Aspirin 75mg", refillDate: "2025-10-15", status: "Due soon" },
    { id: 2, resident: "Vijay Singh", medication: "Metformin 500mg", refillDate: "2025-10-20", status: "Pending" },
  ];

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
              {medicalAlerts.map((alert) => (
                <div key={alert.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{alert.resident}</p>
                      <p className="text-sm text-muted-foreground">{alert.condition}</p>
                    </div>
                    <Badge
                      variant={
                        alert.priority === "high"
                          ? "destructive"
                          : alert.priority === "medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Last checked: {alert.lastCheck}</p>
                </div>
              ))}
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
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{prescription.resident}</p>
                      <p className="text-sm text-muted-foreground">{prescription.medication}</p>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning">
                      {prescription.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Refill date: {prescription.refillDate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
