import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
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
import { useDeleteStaff, useLeaveRequests, useSetLeaveStatus, useStaff } from "@/hooks/queries/staff";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function HR() {
  useDocumentTitle("Staff & HR");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [viewingStaff, setViewingStaff] = useState<any>(null);
  const { user } = useAuth();

  const staffQuery = useStaff();
  const leaveQuery = useLeaveRequests();
  const staffMembers: any[] = staffQuery.data ?? [];
  const leaveRequests = leaveQuery.data ?? [];
  const loading = staffQuery.isLoading || leaveQuery.isLoading;
  const fetchData = () => Promise.all([staffQuery.refetch(), leaveQuery.refetch()]);
  const deleteStaff = useDeleteStaff();
  const setLeaveStatus = useSetLeaveStatus();

  const decideLeave = async (id: string, status: "approved" | "rejected") => {
    try {
      await setLeaveStatus.mutateAsync({ id, status });
      toast.success(`Leave request ${status}`);
    } catch (error: any) {
      toast.error("Failed to update leave request: " + error.message);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    try {
      await deleteStaff.mutateAsync(staffToDelete.id);

      toast.success("Staff member deleted successfully");
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    } catch (error: any) {
      toast.error("Failed to delete staff member: " + error.message);
    }
  };

  const confirmDelete = (staff: any) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const presentCount = staffMembers.filter(s => s.status === 'active').length;
  const onLeaveCount = staffMembers.filter(s => s.status === 'on_leave').length;
  const totalStaff = staffMembers.length;

  const hrStats = [
    {
      title: "Total staff",
      value: totalStaff.toString(),
      trend: `${new Set(staffMembers.map((m) => m.department)).size} departments`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Working",
      value: presentCount.toString(),
      trend: "Status active",
      icon: Calendar,
      color: "text-success",
    },
    {
      title: "On leave",
      value: onLeaveCount.toString(),
      trend: `${leaveRequests.filter(l => l.status === 'approved').length} leave requests approved`,
      icon: Calendar,
      color: "text-warning",
    },
    {
      title: "Leave to decide",
      value: leaveRequests.filter(l => l.status === 'pending').length.toString(),
      trend: "Pending approval",
      icon: Calendar,
      color: "text-secondary",
    },
  ];

  const departments = Object.entries(
    staffMembers.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.department]: (acc[s.department] ?? 0) + 1 }), {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div>
          <h1 className="text-headline-1">Staff & HR</h1>
          <p className="mt-3 text-muted-foreground">Who works here, in which department, and who is on leave.</p>
        </div>
        <PermissionGate permission="hr:create">
          <AddStaffDialog onSuccess={fetchData} />
        </PermissionGate>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            <CardTitle>Staff directory</CardTitle>
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
                      <TableCell className="whitespace-nowrap font-mono text-sm tabular">{staff.phone}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More actions">
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
              <CardTitle>Department overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm bg-foreground/70" aria-hidden="true" />
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
              <CardTitle>Upcoming leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-sm text-muted-foreground">Loading...</div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">No upcoming leave</div>
                ) : (
                  [...leaveRequests].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending")).slice(0, 3).map((leave) => (
                    <div key={leave.id} className="border border-border rounded-lg p-3">
                      <p className="font-medium text-sm text-foreground">{leave.staff?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{leave.reason}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(leave.from_date).toLocaleDateString("en-GB")} to {new Date(leave.to_date).toLocaleDateString("en-GB")}
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
                      {leave.status === "pending" && (
                        <PermissionGate permission="hr:update">
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-7 flex-1"
                              disabled={setLeaveStatus.isPending} onClick={() => decideLeave(leave.id, "approved")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 flex-1 text-destructive"
                              disabled={setLeaveStatus.isPending} onClick={() => decideLeave(leave.id, "rejected")}>
                              Reject
                            </Button>
                          </div>
                        </PermissionGate>
                      )}
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
            <AlertDialogTitle>Delete staff member</AlertDialogTitle>
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
