import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Calendar, DollarSign, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HR() {
  const hrStats = [
    {
      title: "Total Staff",
      value: "48",
      trend: "+2 this month",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Present Today",
      value: "45",
      trend: "94% attendance",
      icon: Calendar,
      color: "text-success",
    },
    {
      title: "On Leave",
      value: "3",
      trend: "2 planned",
      icon: Calendar,
      color: "text-warning",
    },
    {
      title: "Monthly Payroll",
      value: "₹12.5L",
      trend: "Due in 8 days",
      icon: DollarSign,
      color: "text-secondary",
    },
  ];

  const staffMembers = [
    { id: 1, name: "Dr. Sharma", role: "Doctor", department: "Medical", status: "Present", shift: "Day" },
    { id: 2, name: "Nurse Priya", role: "Nurse", department: "Nursing", status: "Present", shift: "Night" },
    { id: 3, name: "Ramesh Kumar", role: "Caretaker", department: "Care", status: "Leave", shift: "Day" },
    { id: 4, name: "Anjali Verma", role: "Nurse", department: "Nursing", status: "Present", shift: "Day" },
    { id: 5, name: "Sunil Patel", role: "Admin", department: "Admin", status: "Present", shift: "Day" },
  ];

  const upcomingLeaves = [
    { name: "Ramesh Kumar", type: "Sick Leave", from: "2025-10-01", to: "2025-10-03", status: "Approved" },
    { name: "Priya Singh", type: "Annual Leave", from: "2025-10-10", to: "2025-10-15", status: "Pending" },
    { name: "Dr. Mehta", type: "Casual Leave", from: "2025-10-05", to: "2025-10-05", status: "Approved" },
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
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
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
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={staff.status === "Present" ? "default" : "secondary"}
                        className={
                          staff.status === "Present"
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-warning/10 text-warning hover:bg-warning/20"
                        }
                      >
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{staff.shift}</TableCell>
                  </TableRow>
                ))}
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
                {upcomingLeaves.map((leave, index) => (
                  <div key={index} className="border border-border rounded-lg p-3">
                    <p className="font-medium text-sm text-foreground">{leave.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{leave.type}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {leave.from} - {leave.to}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          leave.status === "Approved"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {leave.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
