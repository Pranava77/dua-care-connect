import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileCard } from "@/components/UserProfileCard";
import { PermissionGate } from "@/components/PermissionGate";
import { AiProviderCard } from "@/features/ai-settings/AiProviderCard";
import { reportsApi, type ExportType } from "@/lib/api/reports";
import { hasPermission, type Permission } from "@/lib/rbac";

const EXPORTS: { type: ExportType; label: string; permission: Permission }[] = [
  { type: "residents", label: "Residents", permission: "residents:read" },
  { type: "staff", label: "Staff", permission: "hr:read" },
  { type: "invoices", label: "Invoices", permission: "accounting:read" },
  { type: "documents", label: "Documents list", permission: "documents:read" },
  { type: "reports", label: "Reports list", permission: "reports:export" },
];

function ExportsCard() {
  const { user } = useAuth();
  const [busy, setBusy] = useState<ExportType | null>(null);
  const available = EXPORTS.filter((e) => hasPermission(user, e.permission));
  if (!available.length) return null;

  const run = async (type: ExportType) => {
    setBusy(type);
    try {
      await reportsApi.exportCsv(type);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exports</CardTitle>
        <p className="text-sm text-muted-foreground">Download the records your role can see as CSV, for audits or a spreadsheet.</p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {available.map((e) => (
          <Button key={e.type} variant="outline" size="sm" disabled={busy !== null} onClick={() => run(e.type)}>
            {busy === e.type ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {e.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  useDocumentTitle("Settings");
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-headline-1">Settings</h1>
        <p className="mt-3 text-muted-foreground">Your account, data exports and, for administrators, the AI provider and user roles.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <UserProfileCard />
        <div className="space-y-6">
          <ExportsCard />
          <PermissionGate permission="system:settings">
            <AiProviderCard />
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
