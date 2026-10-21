import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Home, Heart, FileText } from "lucide-react";
import type { Resident } from "@/lib/types";

interface ResidentProfileDialogProps {
  resident: Resident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResidentProfileDialog({ resident, open, onOpenChange }: ResidentProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-headline-2">{resident.name}'s Profile</DialogTitle>
          <DialogDescription className="text-body">Detailed information about {resident.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Personal information</h3>
              <p className="flex items-center gap-2 text-muted-foreground text-sm">
                <Home className="h-4 w-4" /> Room: <span className="font-medium text-foreground">{resident.room_number}</span>
              </p>
              <p className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Calendar className="h-4 w-4" /> DOB: <span className="font-medium text-foreground">{new Date(resident.date_of_birth).toLocaleDateString()}</span>
              </p>
              <p className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Phone className="h-4 w-4" /> Emergency Contact: <span className="font-medium text-foreground">{resident.emergency_contact}</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Medical overview</h3>
              {resident.medical_conditions && resident.medical_conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resident.medical_conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {condition}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No medical conditions listed.</p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Recent activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Latest medical record</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Diabetes Type 2</div>
                  <p className="text-xs text-muted-foreground">Last updated: 2024-01-20</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming prescription</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Metformin</div>
                  <p className="text-xs text-muted-foreground">Refill due: 2024-02-15</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}