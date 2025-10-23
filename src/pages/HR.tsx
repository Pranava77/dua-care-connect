import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Users } from "lucide-react";
import { AddStaffDialog } from "@/components/AddStaffDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function HR() {
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [staffResult, leaveResult] = await Promise.all([
        supabase.from('staff').select('*').order('created_at', { ascending: false }),
        supabase.from('leave_requests').select('*, staff(name)').order('from_date', { ascending: true })
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
          <h2 className="text-3xl font-bold text-foreground">HR & Staff Management</h2>
          <p className="text-muted-foreground">Manage staff, attendance, leave, and payroll</p>
        </div>
        <AddStaffDialog onSuccess={fetchData} />
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
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : staffMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No staff members found</TableCell>
                  </TableRow>
                ) : (
                  staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={staff.status === "present" ? "default" : "secondary"}
                          className={
                            staff.status === "present"
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-warning/10 text-warning hover:bg-warning/20"
                          }
                        >
                          {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{staff.shift}</TableCell>
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
                      <p className="text-xs text-muted-foreground mt-1">{leave.leave_type}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            leave.status === "approved"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
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
    </div>
  );
}
