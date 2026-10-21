import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateResident } from "@/hooks/queries/residents";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const residentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  room_number: z.string().trim().min(1, "Room is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  emergency_contact: z.string().trim().min(1, "Emergency contact is required").max(100),
  medical_conditions: z.array(z.string()).optional(),
});

interface EditResidentDialogProps {
  resident: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditResidentDialog({ resident, open, onOpenChange, onSuccess }: EditResidentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const updateResident = useUpdateResident();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<{
    name: string;
    room_number: string;
    date_of_birth: string;
    emergency_contact: string;
    medical_conditions: string[];
  }>({
    name: "",
    room_number: "",
    date_of_birth: "",
    emergency_contact: "",
    medical_conditions: [],
  });

  useEffect(() => {
    if (resident && open) {
      setFormData({
        name: resident.name || "",
        room_number: resident.room_number || "",
        date_of_birth: resident.date_of_birth || "",
        emergency_contact: resident.emergency_contact || "",
        medical_conditions: resident.medical_conditions || [],
      });
    }
  }, [resident, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const validated = residentSchema.parse(formData);

      await updateResident.mutateAsync({ id: resident.id, data: {
        name: validated.name,
        room_number: validated.room_number,
        date_of_birth: validated.date_of_birth,
        emergency_contact: validated.emergency_contact,
        medical_conditions: validated.medical_conditions || [],
      } });

      toast({
        title: "Success",
        description: "Resident updated successfully",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-headline-2">Edit Resident</DialogTitle>
          <DialogDescription className="text-body">Update the resident's information below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room Number *</Label>
              <Input
                id="room"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency">Emergency Contact *</Label>
            <Input
              id="emergency"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              placeholder="Name and phone number"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Resident"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
