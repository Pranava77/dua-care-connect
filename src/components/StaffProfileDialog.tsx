import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail, MapPin, DollarSign, User, Clock } from "lucide-react";
import type { Staff } from "@/lib/types";

interface StaffProfileDialogProps {
  staff: Staff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffProfileDialog({ staff, open, onOpenChange }: StaffProfileDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'inactive':
        return 'bg-destructive/10 text-destructive';
      case 'on_leave':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Medical':
        return 'bg-primary/10 text-primary';
      case 'Nursing':
        return 'bg-secondary/10 text-secondary';
      case 'Care Staff':
        return 'bg-accent/10 text-accent';
      case 'Admin':
        return 'bg-success/10 text-success';
      case 'Support':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-headline-2">{staff.name}'s Profile</DialogTitle>
          <DialogDescription className="text-body">Detailed information about {staff.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Mail className="h-4 w-4" /> 
                  <span className="font-medium text-foreground">{staff.email}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4" /> 
                  <span className="font-medium text-foreground">{staff.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                  <User className="h-4 w-4" /> 
                  <span className="font-medium text-foreground">{staff.position}</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Employment Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getDepartmentColor(staff.department)}>
                    {staff.department}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(staff.status)}>
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </Badge>
                </div>
                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" /> 
                  <span className="font-medium text-foreground">
                    Hired: {new Date(staff.hire_date).toLocaleDateString()}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" /> 
                  <span className="font-medium text-foreground">£{staff.salary.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Employment History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tenure</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor((new Date().getTime() - new Date(staff.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                  </div>
                  <p className="text-xs text-muted-foreground">Since {new Date(staff.hire_date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{staff.status}</div>
                  <p className="text-xs text-muted-foreground">
                    {staff.status === 'active' ? 'Currently working' : 
                     staff.status === 'on_leave' ? 'On leave' : 'Inactive'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto text-primary mb-1" />
                  <p className="text-xs font-medium">Leave Request</p>
                </div>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="text-center">
                  <DollarSign className="h-6 w-6 mx-auto text-success mb-1" />
                  <p className="text-xs font-medium">Payroll</p>
                </div>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="text-center">
                  <User className="h-6 w-6 mx-auto text-secondary mb-1" />
                  <p className="text-xs font-medium">Performance</p>
                </div>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto text-accent mb-1" />
                  <p className="text-xs font-medium">Schedule</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
