import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useInvoices, useRecordPayment } from "@/hooks/queries/accounting";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { CreditCard } from "lucide-react";

const paymentSchema = z.object({
  invoice_id: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0, "Amount must be positive"),
  payment_method: z.enum(['UPI', 'Card', 'NEFT', 'Cash', 'Cheque']),
  transaction_id: z.string().optional(),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

export function RecordPaymentDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: allInvoices = [] } = useInvoices(open);
  // Only unpaid invoices can take a payment
  const invoices = allInvoices.filter((invoice) => invoice.status === 'Pending' || invoice.status === 'Overdue');
  const { toast } = useToast();
  const recordPayment = useRecordPayment();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<{
    invoice_id: string;
    amount: string;
    payment_method: 'UPI' | 'Card' | 'NEFT' | 'Cash' | 'Cheque';
    transaction_id: string;
    payment_date: string;
    notes: string;
  }>({
    invoice_id: "",
    amount: "",
    payment_method: "UPI",
    transaction_id: "",
    payment_date: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setFormData(prev => ({ ...prev, payment_date: new Date().toISOString().split('T')[0] }));
    }
  }, [open]);


  const selectedInvoice = invoices.find(inv => inv.id === formData.invoice_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const validated = paymentSchema.parse({
        invoice_id: formData.invoice_id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        transaction_id: formData.transaction_id || undefined,
        payment_date: formData.payment_date,
        notes: formData.notes || undefined,
      });

      await recordPayment.mutateAsync({
        invoice_id: validated.invoice_id,
        amount: validated.amount,
        payment_method: validated.payment_method,
        transaction_id: validated.transaction_id,
        payment_date: validated.payment_date,
        processed_by: user.name,
        notes: validated.notes,
      });

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      
      setOpen(false);
      setFormData({
        invoice_id: "",
        amount: "",
        payment_method: "UPI",
        transaction_id: "",
        payment_date: "",
        notes: "",
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CreditCard className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Record a payment for an outstanding invoice</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice *</Label>
            <Select
              value={formData.invoice_id}
              onValueChange={(value) => setFormData({ ...formData, invoice_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="invoice">
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} - {invoice.resident_name} (£{invoice.amount.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedInvoice && (
              <div className="text-sm text-muted-foreground">
                Due: {new Date(selectedInvoice.due_date).toLocaleDateString()} | 
                Amount: £{selectedInvoice.amount.toLocaleString()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder={selectedInvoice ? selectedInvoice.amount.toString() : "0"}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value: 'UPI' | 'Card' | 'NEFT' | 'Cash' | 'Cheque') => 
                  setFormData({ ...formData, payment_method: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transaction ID</Label>
              <Input
                id="transaction_id"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                placeholder="Optional transaction reference"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional payment notes"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
