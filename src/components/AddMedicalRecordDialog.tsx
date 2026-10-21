import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useResidents } from "@/hooks/queries/residents";
import { useCreateMedicalRecord } from "@/hooks/queries/medical";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Plus } from "lucide-react";

const medicalRecordSchema = z.object({
  resident_id: z.string().min(1, "Resident is required"),
  diagnosis: z.string().trim().min(2, "Diagnosis must be at least 2 characters").max(200),
  treatment: z.string().trim().min(2, "Treatment must be at least 2 characters").max(500),
  last_check_date: z.string().min(1, "Last check date is required"),
  doctor: z.string().trim().min(2, "Doctor name is required").max(100),
  notes: z.string().trim().max(1000).optional(),
});

export function AddMedicalRecordDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: residents = [] } = useResidents(open);
  const { toast } = useToast();
  const createRecord = useCreateMedicalRecord();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<{
    resident_id: string;
    diagnosis: string;
    treatment: string;
    last_check_date: string;
    doctor: string;
    notes: string;
  }>({
    resident_id: "",
    diagnosis: "",
    treatment: "",
    last_check_date: "",
    doctor: "",
    notes: "",
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const validated = medicalRecordSchema.parse(formData);

      await createRecord.mutateAsync({
        resident_id: validated.resident_id,
        diagnosis: validated.diagnosis,
        treatment: validated.treatment,
        last_check_date: validated.last_check_date,
        doctor: validated.doctor,
        notes: validated.notes || "",
      });

      toast({
        title: "Success",
        description: "Medical record added successfully",
      });
      
      setOpen(false);
      setFormData({
        resident_id: "",
        diagnosis: "",
        treatment: "",
        last_check_date: "",
        doctor: "",
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add medical record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-headline-2">Add medical record</DialogTitle>
          <DialogDescription className="text-body">Enter the medical record information below</DialogDescription>
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
                      {resident.name}, room {resident.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor *</Label>
              <Input
                id="doctor"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                placeholder="Doctor's name"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Medical diagnosis"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment *</Label>
            <Input
              id="treatment"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Treatment plan"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_check_date">Last Check Date *</Label>
            <Input
              id="last_check_date"
              type="date"
              value={formData.last_check_date}
              onChange={(e) => setFormData({ ...formData, last_check_date: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding…" : "Add medical record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
