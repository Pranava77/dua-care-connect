import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddResidentDialog } from "@/components/AddResidentDialog";
import { EditResidentDialog } from "@/components/EditResidentDialog";
import { ResidentProfileDialog } from "@/components/ResidentProfileDialog";
import { PermissionGate } from "@/components/PermissionGate";
import { AdvancedFilter, FilterOptions } from "@/components/AdvancedFilter";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useDeleteResident, useResidents } from "@/hooks/queries/residents";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Resident } from "@/lib/types";

export default function Residents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<any>(null);
  const [editingResident, setEditingResident] = useState<any>(null);
  const [viewingResident, setViewingResident] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: residents = [], isLoading: loading, refetch: fetchResidents } = useResidents();
  const deleteResident = useDeleteResident();

  const handleDeleteResident = async () => {
    if (!residentToDelete) return;
    
    try {
      await deleteResident.mutateAsync(residentToDelete.id);
      toast.success("Resident deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete resident: " + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setResidentToDelete(null);
    }
  };

  const confirmDelete = (resident: any) => {
    setResidentToDelete(resident);
    setDeleteDialogOpen(true);
  };

  const filteredResidents = residents.filter((resident) => {
    // Basic search filter
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Advanced filters
    let matchesFilters = true;
    
    // Room filter
    if (filters.customFields?.room) {
      matchesFilters = matchesFilters && resident.room_number.includes(filters.customFields.room);
    }
    
    // Status filter
    if (filters.status) {
      matchesFilters = matchesFilters && (resident as Resident & { status?: string }).status === filters.status;
    }
    
    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const residentDate = new Date(resident.date_of_birth);
      if (filters.dateRange.start) {
        matchesFilters = matchesFilters && residentDate >= new Date(filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        matchesFilters = matchesFilters && residentDate <= new Date(filters.dateRange.end);
      }
    }
    
    return matchesSearch && matchesFilters;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-1 font-bold text-gradient-primary">Resident Management</h2>
          <p className="text-body text-muted-foreground">View and manage all residents</p>
        </div>
        <PermissionGate permission="residents:create">
          <AddResidentDialog onSuccess={fetchResidents} />
        </PermissionGate>
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
            <AdvancedFilter
              module="residents"
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({})}
              currentFilters={filters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <EmptyState
                        icon={Users}
                        title="No residents found"
                        description="Add your first resident to get started with managing your care facility."
                        actionLabel="Add Resident"
                        onAction={() => {/* Trigger add dialog */}}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents.map((resident, index) => (
                    <TableRow 
                      key={resident.id} 
                      className={`hover:bg-muted/50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
                    >
                      <TableCell className="font-medium">#{resident.id}</TableCell>
                      <TableCell>{resident.name}</TableCell>
                      <TableCell>{resident.room_number}</TableCell>
                      <TableCell>{new Date(resident.date_of_birth).toLocaleDateString()}</TableCell>
                      <TableCell>{resident.emergency_contact}</TableCell>
                      <TableCell>{new Date(resident.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGate permission="residents:read">
                              <DropdownMenuItem onClick={() => navigate(`/residents/${resident.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="residents:update">
                              <DropdownMenuItem onClick={() => setEditingResident(resident)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="residents:delete">
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(resident)}
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
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {editingResident && (
        <EditResidentDialog
          resident={editingResident}
          open={!!editingResident}
          onOpenChange={(open) => !open && setEditingResident(null)}
          onSuccess={() => {
            fetchResidents();
            setEditingResident(null);
          }}
        />
      )}

      {viewingResident && (
        <ResidentProfileDialog
          resident={viewingResident}
          open={!!viewingResident}
          onOpenChange={(open) => !open && setViewingResident(null)}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resident</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {residentToDelete?.name}? This action cannot be undone.
              All associated medical records, documents, and invoices will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResident}
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
