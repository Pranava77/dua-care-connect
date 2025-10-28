import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Eye, Search, Filter, Trash2 } from "lucide-react";
import { UploadDocumentDialog } from "@/components/UploadDocumentDialog";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    admissionCount: 0,
    kycCount: 0,
    pendingCount: 0,
    totalDocuments: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchStats();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await mockApi.getDocuments();
      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast.error("Failed to load documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await mockApi.getDocumentStats();
      if (error) throw error;
      setStats(data);
    } catch (error: any) {
      console.error("Failed to load stats:", error.message);
    }
  };

  const handleViewDocument = (doc: any) => {
    if (doc.file_data) {
      // Open file in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${doc.name}</title></head>
            <body style="margin:0; padding:0;">
              <iframe src="${doc.file_data}" width="100%" height="100%" style="border:none;"></iframe>
            </body>
          </html>
        `);
      }
    } else {
      toast.error("File data not available");
    }
  };

  const handleDownloadDocument = (doc: any) => {
    if (doc.file_data) {
      // Create download link
      const link = document.createElement('a');
      link.href = doc.file_data;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("File data not available");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const { error } = await mockApi.deleteDocument(id);
        if (error) throw error;
        toast.success("Document deleted successfully");
        fetchDocuments();
        fetchStats();
      } catch (error: any) {
        toast.error("Failed to delete document: " + error.message);
      }
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.resident_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Admission", label: "Admission" },
    { value: "KYC", label: "KYC" },
    { value: "Consent", label: "Consent" },
    { value: "Contract", label: "Contract" },
    { value: "Financial", label: "Financial" },
    { value: "Medical", label: "Medical" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-1 font-bold text-foreground">Document Management</h2>
          <p className="text-body text-muted-foreground">Centralized document storage and retrieval</p>
        </div>
        <UploadDocumentDialog onSuccess={() => { fetchDocuments(); fetchStats(); }} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admission Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.admissionCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">KYC Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">{stats.kycCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{stats.pendingCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by name or resident..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-8">Loading documents...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                {searchTerm || categoryFilter !== "all" 
                  ? "No documents match your search criteria" 
                  : "No documents found. Upload your first document to get started."
                }
              </div>
            ) : (
              filteredDocuments.map((doc) => (
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
                        <span className="text-xs text-muted-foreground">{doc.file_type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{doc.file_size}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.resident_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Resident: {doc.resident_name}
                        </p>
                      )}
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.description}
                        </p>
                      )}
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
                          : doc.status === "Pending"
                          ? "bg-warning/10 text-warning hover:bg-warning/20"
                          : ""
                      }
                    >
                      {doc.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="View document"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Download document"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Delete document"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
