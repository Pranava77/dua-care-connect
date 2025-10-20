import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, AlertCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [stats, setStats] = useState({
    residents: 0,
    medicalCases: 0,
    prescriptions: 0,
    staff: 0
  });
  const [recentResidents, setRecentResidents] = useState<any[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [residentsResult, medicalResult, prescriptionsResult, staffResult] = await Promise.all([
        supabase.from('residents').select('*', { count: 'exact' }),
        supabase.from('medical_records').select('*', { count: 'exact' }),
        supabase.from('prescriptions').select('*, residents(name)').order('created_at', { ascending: false }).limit(3),
        supabase.from('staff').select('*', { count: 'exact' })
      ]);

      setStats({
        residents: residentsResult.count || 0,
        medicalCases: medicalResult.count || 0,
        prescriptions: prescriptionsResult.count || 0,
        staff: staffResult.count || 0
      });

      const recentResidentsData = await supabase
        .from('residents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentResidents(recentResidentsData.data || []);
      setRecentPrescriptions(prescriptionsResult.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const dashboardStats = [
    {
      title: "Total Residents",
      value: stats.residents.toString(),
      icon: Users,
      trend: `${recentResidents.length} recent`,
      color: "text-primary",
    },
    {
      title: "Medical Records",
      value: stats.medicalCases.toString(),
      icon: Heart,
      trend: "Active cases",
      color: "text-secondary",
    },
    {
      title: "Prescriptions",
      value: stats.prescriptions.toString(),
      icon: FileText,
      trend: "Total tracked",
      color: "text-warning",
    },
    {
      title: "Staff Members",
      value: stats.staff.toString(),
      icon: AlertCircle,
      trend: "Active staff",
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's your institution overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResidents.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">No recent admissions</div>
              ) : (
                recentResidents.map((resident) => (
                  <div key={resident.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{resident.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Admitted {Math.floor((new Date().getTime() - new Date(resident.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">New</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Prescription Refills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrescriptions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">No upcoming refills</div>
              ) : (
                recentPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{prescription.medication}</p>
                      <p className="text-sm text-muted-foreground">
                        For {prescription.residents?.name}
                      </p>
                    </div>
                    <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">{prescription.status}</span>
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
