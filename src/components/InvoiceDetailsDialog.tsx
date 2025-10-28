import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, FileText, User, CreditCard } from "lucide-react";

interface InvoiceDetailsDialogProps {
  invoice: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDetailsDialog({ invoice, open, onOpenChange }: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-destructive/10 text-destructive';
      case 'cancelled':
        return 'bg-muted/10 text-muted-foreground';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-headline-2">Invoice Details</DialogTitle>
          <DialogDescription className="text-body">
            Complete information for invoice {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice Information
                </span>
                <Badge
                  variant="outline"
                  className={getStatusColor(invoice.status)}
                >
                  {invoice.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Invoice Number</p>
                  <p className="text-lg font-semibold">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(invoice.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                {invoice.paid_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(invoice.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {invoice.payment_method && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {invoice.payment_method}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resident Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Resident Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resident Name</p>
                  <p className="text-lg font-semibold">{invoice.resident_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resident ID</p>
                  <p className="text-lg font-semibold">#{invoice.resident_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Services Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.services?.map((service: any, index: number) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        )}
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(service.amount)}</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          {invoice.status === 'Paid' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="text-lg font-semibold">{invoice.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(invoice.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
