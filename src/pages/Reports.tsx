import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, DollarSign, FileText, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const reportCategories = [
    {
      title: "Operational Reports",
      icon: Users,
      color: "text-primary",
      reports: [
        { name: "Occupancy Report", period: "Monthly", lastGenerated: "2025-10-01" },
        { name: "Admission & Discharge", period: "Monthly", lastGenerated: "2025-10-01" },
        { name: "Room Utilization", period: "Quarterly", lastGenerated: "2025-09-30" },
      ],
    },
    {
      title: "Financial Reports",
      icon: DollarSign,
      color: "text-success",
      reports: [
        { name: "Revenue Report", period: "Monthly", lastGenerated: "2025-10-01" },
        { name: "Payment Collection", period: "Weekly", lastGenerated: "2025-10-02" },
        { name: "Outstanding Dues", period: "Monthly", lastGenerated: "2025-09-30" },
      ],
    },
    {
      title: "Clinical Reports",
      icon: FileText,
      color: "text-secondary",
      reports: [
        { name: "Prescription Due", period: "Weekly", lastGenerated: "2025-10-02" },
        { name: "Medical Alerts", period: "Daily", lastGenerated: "2025-10-02" },
        { name: "Health Checkup Status", period: "Monthly", lastGenerated: "2025-10-01" },
      ],
    },
    {
      title: "HR Reports",
      icon: Calendar,
      color: "text-accent",
      reports: [
        { name: "Attendance Report", period: "Monthly", lastGenerated: "2025-10-01" },
        { name: "Leave Summary", period: "Monthly", lastGenerated: "2025-10-01" },
        { name: "Payroll Report", period: "Monthly", lastGenerated: "2025-09-30" },
      ],
    },
  ];

  const quickStats = [
    { label: "Total Reports", value: "156", trend: "+12 this month" },
    { label: "Pending Reports", value: "3", trend: "Due this week" },
    { label: "Automated Reports", value: "89%", trend: "Schedule active" },
  ];

  const scheduledReports = [
    { name: "Monthly Financial Summary", schedule: "1st of every month", nextRun: "2025-11-01", status: "Active" },
    { name: "Weekly Occupancy Report", schedule: "Every Monday", nextRun: "2025-10-07", status: "Active" },
    { name: "Quarterly Compliance Report", schedule: "Quarterly", nextRun: "2025-12-31", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate and view comprehensive reports</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reportCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className={`h-5 w-5 ${category.color}`} />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.reports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{report.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{report.period}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Last: {report.lastGenerated}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{report.name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.schedule}
                    </span>
                    <span className="text-sm text-muted-foreground">Next: {report.nextRun}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success hover:bg-success/20"
                >
                  {report.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
