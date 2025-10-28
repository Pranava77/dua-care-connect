import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Users, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { AddStaffDialog } from "@/components/AddStaffDialog";
import { EditStaffDialog } from "@/components/EditStaffDialog";
import { StaffProfileDialog } from "@/components/StaffProfileDialog";
import { PermissionGate } from "@/components/PermissionGate";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function HR() {
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [viewingStaff, setViewingStaff] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [staffResult, leaveResult] = await Promise.all([
        mockApi.getStaff(),
        mockApi.getLeaveRequests()
      ]);

      if (staffResult.error) throw staffResult.error;
      if (leaveResult.error) throw leaveResult.error;

      setStaffMembers(staffResult.data || []);
      setLeaveRequests(leaveResult.data || []);
    } catch (error: any) {
      toast.error("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    try {
      const { error } = await mockApi.deleteStaff(staffToDelete.id);
      if (error) throw error;
      
      toast.success("Staff member deleted successfully");
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete staff member: " + error.message);
    }
  };

  const confirmDelete = (staff: any) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const presentCount = staffMembers.filter(s => s.status === 'present').length;
  const onLeaveCount = staffMembers.filter(s => s.status === 'leave').length;
  const totalStaff = staffMembers.length;

  const hrStats = [
    {
      title: "Total Staff",
      value: totalStaff.toString(),
      trend: `${presentCount} present`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Present Today",
      value: presentCount.toString(),
      trend: `${totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0}% attendance`,
      icon: Calendar,
      color: "text-success",
    },
    {
      title: "On Leave",
      value: onLeaveCount.toString(),
      trend: `${leaveRequests.filter(l => l.status === 'approved').length} approved`,
      icon: Calendar,
      color: "text-warning",
    },
    {
      title: "Active Requests",
      value: leaveRequests.filter(l => l.status === 'pending').length.toString(),
      trend: "Pending approval",
      icon: DollarSign,
      color: "text-secondary",
    },
  ];

  const departments = [
    { name: "Medical", count: 8, color: "bg-primary" },
    { name: "Nursing", count: 18, color: "bg-secondary" },
    { name: "Care Staff", count: 12, color: "bg-accent" },
    { name: "Admin", count: 6, color: "bg-success" },
    { name: "Support", count: 4, color: "bg-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-1 font-bold text-foreground">HR & Staff Management</h2>
          <p className="text-muted-foreground">Manage staff, attendance, leave, and payroll</p>
        </div>
        <PermissionGate permission="hr:create">
          <AddStaffDialog onSuccess={fetchData} />
        </PermissionGate>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {hrStats.map((stat) => (
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
            <CardTitle>Staff Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : staffMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No staff members found</TableCell>
                  </TableRow>
                ) : (
                  staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {staff.department}
                        </Badge>
                      </TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>{staff.phone}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGate permission="hr:read">
                              <DropdownMenuItem onClick={() => setViewingStaff(staff)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="hr:update">
                              <DropdownMenuItem onClick={() => setEditingStaff(staff)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="hr:delete">
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(staff)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </PermissionGate>
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

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                      <span className="text-sm font-medium text-foreground">{dept.name}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{dept.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-sm text-muted-foreground">Loading...</div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">No upcoming leave</div>
                ) : (
                  leaveRequests.slice(0, 3).map((leave) => (
                    <div key={leave.id} className="border border-border rounded-lg p-3">
                      <p className="font-medium text-sm text-foreground">{leave.staff?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{leave.reason}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            leave.status === "approved"
                              ? "bg-success/10 text-success"
                              : leave.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Components */}
      {editingStaff && (
        <EditStaffDialog
          staff={editingStaff}
          open={!!editingStaff}
          onOpenChange={(open) => !open && setEditingStaff(null)}
          onSuccess={() => {
            fetchData();
            setEditingStaff(null);
          }}
        />
      )}

      {viewingStaff && (
        <StaffProfileDialog
          staff={viewingStaff}
          open={!!viewingStaff}
          onOpenChange={(open) => !open && setViewingStaff(null)}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone.
              All associated records, leave requests, and documents will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
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
