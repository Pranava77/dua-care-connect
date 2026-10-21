import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
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
import { useAlerts } from "@/hooks/queries/ai";
import { Corridor } from "@/features/corridor/Corridor";
import { DoorChip } from "@/components/door/DoorChip";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Resident } from "@/lib/types";

export default function Residents() {
  useDocumentTitle("Residents");
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
  const { data: alerts = [] } = useAlerts();

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

  const floorCount = new Set(residents.map((r) => r.room_number.charAt(0))).size;

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-headline-1">Residents</h1>
          <p className="mt-3 text-muted-foreground">
            {residents.length} {residents.length === 1 ? "resident" : "residents"} on {floorCount} {floorCount === 1 ? "floor" : "floors"}. Each has their own door.
          </p>
        </div>
        <PermissionGate permission="residents:create">
          <AddResidentDialog onSuccess={fetchResidents} />
        </PermissionGate>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Find a resident by name or room"
            aria-label="Find a resident by name or room"
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

      <section aria-label="Corridors">
        {loading ? (
          <div className="corridor-skeleton rounded-lg bg-muted/60" aria-hidden="true" />
        ) : filteredResidents.length === 0 ? (
          <EmptyState
            icon={Users}
            title={residents.length ? "No door matches that search" : "No residents yet"}
            description={residents.length ? "Try a first name or a room number such as 102." : "Add the first resident to give them a door."}
          />
        ) : (
          <Corridor residents={filteredResidents} alerts={alerts} />
        )}
      </section>

      <section aria-labelledby="register" className="space-y-4">
        <h2 id="register" className="text-headline-2">Register</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {loading ? (
            <SkeletonTable rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resident</TableHead>
                  <TableHead>Born</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Emergency contact</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.map((resident) => (
                  <TableRow key={resident.id} className="door-row">
                    <TableCell>
                      <DoorChip residentId={resident.id} room={resident.room_number} name={resident.name} link />
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular">
                      {new Date(resident.date_of_birth).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-sm">{resident.medical_conditions.join(", ") || "None recorded"}</TableCell>
                    <TableCell className="text-sm">{resident.emergency_contact}</TableCell>
                    <TableCell className="font-mono text-sm tabular">
                      {new Date(resident.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={`Actions for ${resident.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/residents/${resident.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Open profile
                          </DropdownMenuItem>
                          <PermissionGate permission="residents:update">
                            <DropdownMenuItem onClick={() => setEditingResident(resident)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionGate>
                          <PermissionGate permission="residents:delete">
                            <DropdownMenuItem onClick={() => confirmDelete(resident)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Discharge and delete
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

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
            <AlertDialogTitle>Delete resident</AlertDialogTitle>
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
