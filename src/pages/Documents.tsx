import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Documents() {
  const documents = [
    { id: 1, name: "Admission Form - Rajesh Kumar", category: "Admission", date: "2023-06-15", status: "Verified" },
    { id: 2, name: "Medical Consent - Meena Patel", category: "Consent", date: "2023-08-22", status: "Pending" },
    { id: 3, name: "Aadhaar Card - Suresh Reddy", category: "KYC", date: "2023-04-10", status: "Verified" },
    { id: 4, name: "Contract - Lakshmi Iyer", category: "Contract", date: "2023-09-05", status: "Active" },
    { id: 5, name: "Invoice Receipt - Vijay Singh", category: "Financial", date: "2025-10-01", status: "Paid" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Document Management</h2>
          <p className="text-muted-foreground">Centralized document storage and retrieval</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admission Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">45</p>
            <p className="text-sm text-muted-foreground mt-1">Total documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">KYC Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">124</p>
            <p className="text-sm text-muted-foreground mt-1">Total documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">8</p>
            <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{doc.category}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      doc.status === "Verified" || doc.status === "Active" || doc.status === "Paid"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      doc.status === "Verified" || doc.status === "Active" || doc.status === "Paid"
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : ""
                    }
                  >
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
