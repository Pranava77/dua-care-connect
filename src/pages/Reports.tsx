import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Users, PoundSterling, FileText, Calendar, Clock } from "lucide-react";
import { useGenerateReport, useReports } from "@/hooks/queries/reports";
import { keys } from "@/hooks/queries/keys";
import { residentsApi } from "@/lib/api/residents";
import { accountingApi } from "@/lib/api/accounting";
import { medicalApi } from "@/lib/api/medical";
import { reportsApi } from "@/lib/api/reports";
import { AiReportDrafts } from "@/features/ai-reports/AiReportDrafts";
import { PermissionGate } from "@/components/PermissionGate";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Reports() {
  useDocumentTitle("Reports");
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: reports = [], isLoading: loading } = useReports();
  const generateReport = useGenerateReport();
  const queryClient = useQueryClient();

  const handleGenerateReport = async (reportId: string) => {
    setGeneratingReport(reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      // Generate actual PDF based on report type
      switch (report.type) {
        case 'residents':
          const residentsData = await queryClient.fetchQuery({ queryKey: keys.residents, queryFn: () => residentsApi.list() });
          await (await import("@/lib/pdfGenerator")).generateResidentReport(residentsData || [], user?.name || 'System');
          break;
        case 'financial':
          const invoicesData = await queryClient.fetchQuery({ queryKey: keys.invoices, queryFn: () => accountingApi.listInvoices() });
          await (await import("@/lib/pdfGenerator")).generateFinancialReport(invoicesData || [], user?.name || 'System');
          break;
        case 'medical':
          const medicalData = await queryClient.fetchQuery({ queryKey: keys.medicalRecords, queryFn: () => medicalApi.listRecords() });
          const prescriptionsData = await queryClient.fetchQuery({ queryKey: keys.prescriptions, queryFn: () => medicalApi.listPrescriptions() });
          await (await import("@/lib/pdfGenerator")).generateMedicalReport(medicalData || [], prescriptionsData || [], user?.name || 'System');
          break;
        default:
          // Generic report generation
          break;
      }
      // Records the generation server-side (updates last_generated)
      await generateReport.mutateAsync(reportId);

      toast.success(`${report.name} generated and downloaded successfully`);
    } catch (error: any) {
      toast.error("Failed to generate report: " + error.message);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleExportAll = async () => {
    try {
      await reportsApi.exportCsv('reports');
      toast.success("Reports exported");
    } catch (error: any) {
      toast.error("Failed to export reports: " + error.message);
    }
  };

  const reportCategories = [
    {
      title: "Operational reports",
      icon: Users,
      color: "text-foreground",
      reports: reports.filter(r => r.category === 'Operational'),
    },
    {
      title: "Financial reports",
      icon: PoundSterling,
      color: "text-foreground",
      reports: reports.filter(r => r.category === 'Financial'),
    },
    {
      title: "Clinical reports",
      icon: FileText,
      color: "text-foreground",
      reports: reports.filter(r => r.category === 'Clinical'),
    },
    {
      title: "HR Reports",
      icon: Calendar,
      color: "text-foreground",
      reports: reports.filter(r => r.category === 'HR'),
    },
  ];

  const quickStats = [
    { 
      label: "Total reports", 
      value: reports.length.toString(), 
      trend: `Across ${new Set(reports.map((r) => r.category)).size} categories`,
      icon: FileText
    },
    { 
      label: "Active reports", 
      value: reports.filter(r => r.status === 'Active').length.toString(), 
      trend: "Schedule active",
      icon: TrendingUp
    },
    { 
      label: "Generated today", 
      value: reports.filter(r => {
        const today = new Date().toDateString();
        return new Date(r.last_generated).toDateString() === today;
      }).length.toString(), 
      trend: "Recent activity",
      icon: Clock
    },
  ];

  const scheduledReports = reports.filter(r => r.next_scheduled);

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div>
          <h1 className="text-headline-1">Reports</h1>
          <p className="mt-3 text-muted-foreground">Download standard reports as PDF, or have the assistant draft one from today’s records.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleExportAll}>
          <Download className="h-4 w-4 mr-2" />
          Export all
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className="h-4 w-4" />
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

      <PermissionGate permission="reports:generate">
        <AiReportDrafts />
      </PermissionGate>

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
                {loading ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Loading reports...</div>
                ) : category.reports.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">No reports available</div>
                ) : (
                  category.reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{report.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{report.period}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            Last: {new Date(report.last_generated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            report.status === "Active"
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-muted/10 text-muted-foreground"
                          }
                        >
                          {report.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={generatingReport === report.id}
                          aria-label={`Download ${report.name} as PDF`}
                        >
                          {generatingReport === report.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduledReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{report.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.period} schedule
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Next: {new Date(report.next_scheduled).toLocaleDateString()}
                      </span>
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
      )}
    </div>
  );
}
