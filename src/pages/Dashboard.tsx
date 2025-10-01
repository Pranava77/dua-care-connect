import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, AlertCircle, DollarSign } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Residents",
      value: "124",
      icon: Users,
      trend: "+3 this month",
      color: "text-primary",
    },
    {
      title: "Active Medical Cases",
      value: "18",
      icon: Heart,
      trend: "2 critical",
      color: "text-secondary",
    },
    {
      title: "Pending Payments",
      value: "₹2.4L",
      icon: DollarSign,
      trend: "12 overdue",
      color: "text-warning",
    },
    {
      title: "Alerts",
      value: "5",
      icon: AlertCircle,
      trend: "Requires attention",
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's your institution overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">Resident Name {i}</p>
                    <p className="text-sm text-muted-foreground">Admitted {i} days ago</p>
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">New</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Prescription Refills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">Medication {i}</p>
                    <p className="text-sm text-muted-foreground">Due in {i + 2} days</p>
                  </div>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">Pending</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
