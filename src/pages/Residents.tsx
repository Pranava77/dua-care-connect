import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Residents() {
  const [searchTerm, setSearchTerm] = useState("");

  const residents = [
    { id: 1, name: "Rajesh Kumar", age: 72, room: "A-101", status: "Active", joinDate: "2023-06-15" },
    { id: 2, name: "Meena Patel", age: 68, room: "B-205", status: "Active", joinDate: "2023-08-22" },
    { id: 3, name: "Suresh Reddy", age: 75, room: "A-103", status: "Medical Care", joinDate: "2023-04-10" },
    { id: 4, name: "Lakshmi Iyer", age: 70, room: "C-301", status: "Active", joinDate: "2023-09-05" },
    { id: 5, name: "Vijay Singh", age: 78, room: "B-202", status: "Active", joinDate: "2023-07-18" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Resident Management</h2>
          <p className="text-muted-foreground">View and manage all residents</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add New Resident
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search residents by name, room, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">#{resident.id}</TableCell>
                  <TableCell>{resident.name}</TableCell>
                  <TableCell>{resident.age}</TableCell>
                  <TableCell>{resident.room}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        resident.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {resident.status}
                    </span>
                  </TableCell>
                  <TableCell>{resident.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
