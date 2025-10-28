import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Plus } from "lucide-react";

const prescriptionSchema = z.object({
  resident_id: z.string().min(1, "Resident is required"),
  medication: z.string().trim().min(2, "Medication name is required").max(100),
  dosage: z.string().trim().min(1, "Dosage is required").max(50),
  frequency: z.string().trim().min(1, "Frequency is required").max(50),
  refill_date: z.string().min(1, "Refill date is required"),
  prescribing_doctor: z.string().trim().min(2, "Doctor name is required").max(100),
});

export function AddPrescriptionDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<{
    resident_id: string;
    medication: string;
    dosage: string;
    frequency: string;
    refill_date: string;
    prescribing_doctor: string;
  }>({
    resident_id: "",
    medication: "",
    dosage: "",
    frequency: "",
    refill_date: "",
    prescribing_doctor: "",
  });

  useEffect(() => {
    if (open) {
      fetchResidents();
    }
  }, [open]);

  const fetchResidents = async () => {
    try {
      const { data } = await mockApi.getResidents();
      setResidents(data || []);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const validated = prescriptionSchema.parse(formData);

      const { error } = await mockApi.insertPrescription({
        resident_id: validated.resident_id,
        medication: validated.medication,
        dosage: validated.dosage,
        frequency: validated.frequency,
        refill_date: validated.refill_date,
        prescribing_doctor: validated.prescribing_doctor,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription added successfully",
      });
      
      setOpen(false);
      setFormData({
        resident_id: "",
        medication: "",
        dosage: "",
        frequency: "",
        refill_date: "",
        prescribing_doctor: "",
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-headline-2">Add Prescription</DialogTitle>
          <DialogDescription className="text-body">Enter the prescription information below</DialogDescription>
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
              <Label htmlFor="prescribing_doctor">Prescribing Doctor *</Label>
              <Input
                id="prescribing_doctor"
                value={formData.prescribing_doctor}
                onChange={(e) => setFormData({ ...formData, prescribing_doctor: e.target.value })}
                placeholder="Doctor's name"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication">Medication *</Label>
            <Input
              id="medication"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              placeholder="Medication name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 500mg"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refill_date">Refill Date *</Label>
            <Input
              id="refill_date"
              type="date"
              value={formData.refill_date}
              onChange={(e) => setFormData({ ...formData, refill_date: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
