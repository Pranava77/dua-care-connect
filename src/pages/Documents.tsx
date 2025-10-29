import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Eye, Search, Filter, Trash2, Users, Heart, DollarSign, UserCog, BarChart3, ArrowRight, LogIn } from "lucide-react";
import { UploadDocumentDialog } from "@/components/UploadDocumentDialog";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
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

  // Demo data for showcasing when not logged in
  const demoDocuments = [
    {
      id: "demo-1",
      name: "Sample Admission Form.pdf",
      category: "Admission",
      file_type: "PDF",
      file_size: "245 KB",
      uploaded_at: new Date().toISOString(),
      status: "Verified",
      description: "Example admission document"
    },
    {
      id: "demo-2",
      name: "Resident Medical History.pdf",
      category: "Medical",
      file_type: "PDF",
      file_size: "1.2 MB",
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
      status: "Verified",
      description: "Comprehensive medical records"
    },
    {
      id: "demo-3",
      name: "Financial Agreement.pdf",
      category: "Financial",
      file_type: "PDF",
      file_size: "180 KB",
      uploaded_at: new Date(Date.now() - 172800000).toISOString(),
      status: "Pending",
      description: "Payment and billing agreement"
    }
  ];

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchStats();
    } else {
      // Show demo data when not authenticated
      setDocuments(demoDocuments);
      setStats({
        admissionCount: 12,
        kycCount: 8,
        pendingCount: 3,
        totalDocuments: 23
      });
      setLoading(false);
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
    if (!user) {
      toast.info("Please log in to view documents");
      return;
    }
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
    if (!user) {
      toast.info("Please log in to download documents");
      return;
    }
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
      {/* Informational Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 border-primary/20">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-headline-1 font-bold text-foreground">
                Welcome to <span className="text-gradient-primary">SilverSync</span>
              </h1>
              <p className="text-body text-lg text-muted-foreground max-w-3xl mx-auto">
                A comprehensive care management platform designed for modern healthcare facilities. 
                Streamline operations, improve care quality, and manage everything in one powerful, intuitive system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Resident Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete resident profiles, admission tracking, and comprehensive care planning
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Medical Records</h3>
                      <p className="text-sm text-muted-foreground">
                        Electronic medical records, prescriptions, and treatment history management
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Document Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Centralized storage for admission forms, KYC documents, and contracts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Accounting</h3>
                      <p className="text-sm text-muted-foreground">
                        Billing, invoicing, payment tracking, and financial reporting
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <UserCog className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">HR & Staff Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Staff profiles, scheduling, attendance, and role-based access control
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Reports & Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive reporting, analytics, and insights for data-driven decisions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!user && (
              <div className="text-center pt-6 space-y-4">
                <p className="text-body text-muted-foreground">
                  Log in to access all features and manage your care facility
                </p>
                <Button asChild size="lg" className="gap-2">
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Sign In to Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-1 font-bold text-foreground">Document Management</h2>
          <p className="text-body text-muted-foreground">Centralized document storage and retrieval</p>
        </div>
        {user && <UploadDocumentDialog onSuccess={() => { fetchDocuments(); fetchStats(); }} />}
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
                  : user
                    ? "No documents found. Upload your first document to get started."
                    : "No documents match your search criteria. Log in to see your documents."
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
                    {user && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Delete document"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
