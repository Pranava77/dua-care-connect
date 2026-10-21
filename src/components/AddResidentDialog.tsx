import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateResident } from "@/hooks/queries/residents";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Plus } from "lucide-react";

const residentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  room_number: z.string().trim().min(1, "Room is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  emergency_contact: z.string().trim().min(1, "Emergency contact is required").max(100),
  medical_conditions: z.array(z.string()).optional(),
});

export function AddResidentDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const createResident = useCreateResident();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const validated = residentSchema.parse(formData);

      await createResident.mutateAsync({
        name: validated.name,
        room_number: validated.room_number,
        date_of_birth: validated.date_of_birth,
        emergency_contact: validated.emergency_contact,
        medical_conditions: validated.medical_conditions || [],
      });

      toast({
        title: "Success",
        description: "Resident added successfully",
      });
      
      setOpen(false);
      setFormData({
        name: "",
        room_number: "",
        date_of_birth: "",
        emergency_contact: "",
        medical_conditions: [],
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
          Add resident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-headline-2">Add new resident</DialogTitle>
          <DialogDescription className="text-body">Enter the resident's information below</DialogDescription>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding…" : "Add Resident"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
