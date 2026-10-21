import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Download, TrendingUp, TrendingDown, PoundSterling, CreditCard, Search, Filter, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { EditInvoiceDialog } from "@/components/EditInvoiceDialog";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";
import { useDeleteInvoice, useFinancialStats, useInvoices, useUpdateInvoice } from "@/hooks/queries/accounting";
import { reportsApi } from "@/lib/api/reports";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DoorChip } from "@/components/door/DoorChip";
import { formatGBP } from "@/lib/format";
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
  useDocumentTitle("Accounting");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const { user } = useAuth();

  const invoicesQuery = useInvoices();
  const statsQuery = useFinancialStats();
  const invoices = invoicesQuery.data ?? [];
  const loading = invoicesQuery.isLoading;
  const financialStats = statsQuery.data ?? {
    totalRevenue: 0, outstandingDues: 0, thisMonthRevenue: 0, paidToday: 0, paidTodayCount: 0,
  };
  // Mutations invalidate both queries; dialogs still accept an explicit refresh callback.
  const fetchInvoices = () => invoicesQuery.refetch();
  const fetchFinancialStats = () => statsQuery.refetch();
  const deleteInvoice = useDeleteInvoice();
  const updateInvoice = useUpdateInvoice();

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    
    try {
      await deleteInvoice.mutateAsync(invoiceToDelete.id);
      toast.success("Invoice deleted successfully");
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
      await updateInvoice.mutateAsync({ id: invoice.id, data: { status: 'Cancelled' } });
      toast.success("Invoice cancelled successfully");
    } catch (error: any) {
      toast.error("Failed to cancel invoice: " + error.message);
    }
  };

  const handleExport = async () => {
    try {
      await reportsApi.exportCsv('invoices');
      toast.success("Invoices exported");
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

  // Billed by service, summed from the line items of every invoice that is not cancelled.
  const billed = new Map<string, number>();
  for (const invoice of invoices) {
    if (invoice.status === "Cancelled") continue;
    for (const line of invoice.services) billed.set(line.name, (billed.get(line.name) ?? 0) + line.amount);
  }
  const billedTotal = [...billed.values()].reduce((a, b) => a + b, 0) || 1;
  const services = [...billed.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, revenue: formatGBP(amount), percentage: Math.round((amount / billedTotal) * 100) }));
  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const unpaidCount = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue").length;
  const monthName = new Date().toLocaleDateString("en-GB", { month: "long" });

  const statusOptions = [
    { value: "all", label: "All status" },
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
    { value: "Overdue", label: "Overdue" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const stats = [
    {
      title: "Total revenue",
      value: formatGBP(financialStats.totalRevenue),
      trend: `${paidCount} paid ${paidCount === 1 ? "invoice" : "invoices"}`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Outstanding dues",
      value: formatGBP(financialStats.outstandingDues),
      trend: `${unpaidCount} unpaid ${unpaidCount === 1 ? "invoice" : "invoices"}`,
      icon: TrendingDown,
      color: "text-warning",
    },
    {
      title: "This month",
      value: formatGBP(financialStats.thisMonthRevenue),
      trend: `Paid in ${monthName}`,
      icon: PoundSterling,
      color: "text-primary",
    },
    {
      title: "Paid today",
      value: formatGBP(financialStats.paidToday),
      trend: `${financialStats.paidTodayCount} payments`,
      icon: CreditCard,
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div>
          <h1 className="text-headline-1">Accounting</h1>
          <p className="mt-3 text-muted-foreground">Invoices, payments and what each resident owes. Amounts in pounds sterling.</p>
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
              <CardTitle>Recent invoices</CardTitle>
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
                  <SelectTrigger className="w-[140px]" aria-label="Filter by status">
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
                  <TableHead>Due date</TableHead>
                  <TableHead>Payment method</TableHead>
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
                      <TableCell><DoorChip residentId={invoice.resident_id} name={invoice.resident_name} link /></TableCell>
                      <TableCell className="font-semibold">£{invoice.amount.toLocaleString()}</TableCell>
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
                            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More actions">
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
            <CardTitle>Billed by service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{service.name}</span>
                    <span className="text-muted-foreground">{service.revenue}</span>
                  </div>
                  <div className="w-full bg-muted rounded-sm h-2">
                    <div
                      className="bg-primary h-2 rounded-sm"
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
            <AlertDialogTitle>Delete invoice</AlertDialogTitle>
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
