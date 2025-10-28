import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Search, Filter, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { EditInvoiceDialog } from "@/components/EditInvoiceDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Accounting() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    outstandingDues: 0,
    thisMonthRevenue: 0,
    paidToday: 0,
    paidTodayCount: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInvoices();
      fetchFinancialStats();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await mockApi.getInvoices();
      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast.error("Failed to load invoices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      const { data, error } = await mockApi.getFinancialStats();
      if (error) throw error;
      setFinancialStats(data);
    } catch (error: any) {
      console.error("Failed to load financial stats:", error.message);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    
    try {
      const { error } = await mockApi.deleteInvoice(invoiceToDelete.id);
      if (error) throw error;
      
      toast.success("Invoice deleted successfully");
      fetchInvoices();
      fetchFinancialStats();
    } catch (error: any) {
      toast.error("Failed to delete invoice: " + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const confirmDelete = (invoice: any) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleCancelInvoice = async (invoice: any) => {
    try {
      const { error } = await mockApi.updateInvoice(invoice.id, { status: 'Cancelled' });
      if (error) throw error;
      
      toast.success("Invoice cancelled successfully");
      fetchInvoices();
      fetchFinancialStats();
    } catch (error: any) {
      toast.error("Failed to cancel invoice: " + error.message);
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await mockApi.exportData('invoices');
      if (error) throw error;
      toast.success("Export started. Download will begin shortly.");
      // In a real app, this would trigger a file download
      console.log("Export URL:", data.download_url);
    } catch (error: any) {
      toast.error("Failed to export data: " + error.message);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.resident_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const services = [
    { name: "Room Charges", revenue: "₹8.5L", percentage: 46 },
    { name: "Nursing Care", revenue: "₹5.2L", percentage: 28 },
    { name: "Medical Services", revenue: "₹3.1L", percentage: 17 },
    { name: "Diagnostics", revenue: "₹1.7L", percentage: 9 },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
    { value: "Overdue", label: "Overdue" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${(financialStats.totalRevenue / 100000).toFixed(1)}L`,
      trend: "+12.5%",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Outstanding Dues",
      value: `₹${(financialStats.outstandingDues / 100000).toFixed(1)}L`,
      trend: "-5.2%",
      icon: TrendingDown,
      color: "text-warning",
    },
    {
      title: "This Month",
      value: `₹${(financialStats.thisMonthRevenue / 100000).toFixed(1)}L`,
      trend: "+8.3%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Paid Today",
      value: `₹${(financialStats.paidToday / 1000).toFixed(0)}K`,
      trend: `${financialStats.paidTodayCount} payments`,
      icon: CreditCard,
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-1 font-bold text-foreground">Accounting & Billing</h2>
          <p className="text-body text-muted-foreground">Manage invoices, payments, and financial records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <RecordPaymentDialog onSuccess={() => { fetchInvoices(); fetchFinancialStats(); }} />
          <CreateInvoiceDialog onSuccess={() => { fetchInvoices(); fetchFinancialStats(); }} />
        </div>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <CardTitle>Recent Invoices</CardTitle>
              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading invoices...</TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {searchTerm || statusFilter !== "all" 
                        ? "No invoices match your search criteria" 
                        : "No invoices found. Create your first invoice to get started."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.resident_name}</TableCell>
                      <TableCell className="font-semibold">₹{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "Paid"
                              ? "default"
                              : invoice.status === "Overdue"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            invoice.status === "Paid"
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : invoice.status === "Overdue"
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : invoice.status === "Pending"
                              ? "bg-warning/10 text-warning hover:bg-warning/20"
                              : ""
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{invoice.payment_method || "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingInvoice(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                              <DropdownMenuItem onClick={() => setEditingInvoice(invoice)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                              <DropdownMenuItem onClick={() => handleCancelInvoice(invoice)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => confirmDelete(invoice)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{service.name}</span>
                    <span className="text-muted-foreground">{service.revenue}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{service.percentage}% of total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {editingInvoice && (
        <EditInvoiceDialog
          invoice={editingInvoice}
          open={!!editingInvoice}
          onOpenChange={(open) => !open && setEditingInvoice(null)}
          onSuccess={() => {
            fetchInvoices();
            fetchFinancialStats();
            setEditingInvoice(null);
          }}
        />
      )}

      {viewingInvoice && (
        <InvoiceDetailsDialog
          invoice={viewingInvoice}
          open={!!viewingInvoice}
          onOpenChange={(open) => !open && setViewingInvoice(null)}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoiceToDelete?.invoice_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
