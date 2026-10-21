import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useResidents } from "@/hooks/queries/residents";
import { useUpdateInvoice } from "@/hooks/queries/accounting";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import type { Invoice } from "@/lib/types";
import { Plus, X } from "lucide-react";

const invoiceSchema = z.object({
  resident_id: z.string().min(1, "Resident is required"),
  amount: z.number().min(0, "Amount must be positive"),
  due_date: z.string().min(1, "Due date is required"),
  services: z.array(z.object({
    name: z.string().min(1, "Service name is required"),
    amount: z.number().min(0, "Service amount must be positive"),
    description: z.string().optional(),
  })).min(1, "At least one service is required"),
  notes: z.string().optional(),
});

interface EditInvoiceDialogProps {
  invoice: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditInvoiceDialog({ invoice, open, onOpenChange, onSuccess }: EditInvoiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: residents = [] } = useResidents(open);
  const { toast } = useToast();
  const updateInvoice = useUpdateInvoice();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<{
    resident_id: string;
    amount: string;
    due_date: string;
    services: Array<{
      name: string;
      amount: string;
      description: string;
    }>;
    notes: string;
  }>({
    resident_id: "",
    amount: "",
    due_date: "",
    services: [{ name: "", amount: "", description: "" }],
    notes: "",
  });

  useEffect(() => {
    if (invoice && open) {
      setFormData({
        resident_id: invoice.resident_id || "",
        amount: invoice.amount?.toString() || "",
        due_date: invoice.due_date || "",
        services: invoice.services?.map((service: any) => ({
          name: service.name || "",
          amount: service.amount?.toString() || "",
          description: service.description || "",
        })) || [{ name: "", amount: "", description: "" }],
        notes: invoice.notes || "",
      });
    }
  }, [invoice, open]);


  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: "", amount: "", description: "" }]
    });
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData({
        ...formData,
        services: formData.services.filter((_, i) => i !== index)
      });
    }
  };

  const updateService = (index: number, field: string, value: string) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setFormData({ ...formData, services: updatedServices });
  };

  const calculateTotal = () => {
    return formData.services.reduce((sum, service) => {
      return sum + (parseFloat(service.amount) || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const totalAmount = calculateTotal();
      const validated = invoiceSchema.parse({
        resident_id: formData.resident_id,
        amount: totalAmount,
        due_date: formData.due_date,
        services: formData.services.map(service => ({
          name: service.name,
          amount: parseFloat(service.amount) || 0,
          description: service.description || undefined,
        })),
        notes: formData.notes || undefined,
      });

      await updateInvoice.mutateAsync({ id: invoice.id, data: {
        resident_id: validated.resident_id,
        amount: validated.amount,
        due_date: validated.due_date,
        services: validated.services as Invoice["services"],
        notes: validated.notes,
      } });

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>Update the invoice information below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resident">Resident *</Label>
              <Select
                value={formData.resident_id}
                onValueChange={(value) => setFormData({ ...formData, resident_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="resident">
                  <SelectValue placeholder="Select resident" />
                </SelectTrigger>
                <SelectContent>
                  {residents.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.name} - Room {resident.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Services *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addService} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-1" />
                Add Service
              </Button>
            </div>
            
            {formData.services.map((service, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label htmlFor={`service-name-${index}`}>Service Name</Label>
                  <Input
                    id={`service-name-${index}`}
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    placeholder="e.g., Room Charges"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor={`service-amount-${index}`}>Amount</Label>
                  <Input
                    id={`service-amount-${index}`}
                    type="number"
                    value={service.amount}
                    onChange={(e) => updateService(index, 'amount', e.target.value)}
                    placeholder="0"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="col-span-4">
                  <Label htmlFor={`service-desc-${index}`}>Description</Label>
                  <Input
                    id={`service-desc-${index}`}
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    placeholder="Optional description"
                    disabled={isLoading}
                  />
                </div>
                <div className="col-span-1">
                  {formData.services.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeService(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="text-right">
              <div className="text-lg font-semibold">
                Total: £{calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes for the invoice"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
