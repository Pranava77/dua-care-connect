import { useState } from "react";
import { Filter, X, Calendar, User, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string;
  category?: string;
  department?: string;
  amountRange?: {
    min: string;
    max: string;
  };
  customFields?: Record<string, string>;
}

interface AdvancedFilterProps {
  module: 'residents' | 'staff' | 'medical' | 'documents' | 'accounting' | 'hr';
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  currentFilters: FilterOptions;
}

export function AdvancedFilter({ module, onFiltersChange, onClearFilters, currentFilters }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.department) count++;
    if (filters.amountRange?.min || filters.amountRange?.max) count++;
    return count;
  };

  const renderModuleSpecificFilters = () => {
    switch (module) {
      case 'residents':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="room-filter">Room Number</Label>
              <Input
                id="room-filter"
                placeholder="e.g., 101, 102"
                value={filters.customFields?.room || ''}
                onChange={(e) => handleFilterChange('customFields', { ...filters.customFields, room: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'staff':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="department-filter">Department</Label>
              <Select
                value={filters.department || ''}
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Nursing">Nursing</SelectItem>
                  <SelectItem value="Care Staff">Care Staff</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'medical':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="doctor-filter">Doctor</Label>
              <Input
                id="doctor-filter"
                placeholder="Doctor name"
                value={filters.customFields?.doctor || ''}
                onChange={(e) => handleFilterChange('customFields', { ...filters.customFields, doctor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'documents':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admission">Admission</SelectItem>
                  <SelectItem value="KYC">KYC</SelectItem>
                  <SelectItem value="Consent">Consent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'accounting':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="min-amount">Min Amount</Label>
                <Input
                  id="min-amount"
                  type="number"
                  placeholder="0"
                  value={filters.amountRange?.min || ''}
                  onChange={(e) => handleFilterChange('amountRange', { 
                    ...filters.amountRange, 
                    min: e.target.value 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-amount">Max Amount</Label>
                <Input
                  id="max-amount"
                  type="number"
                  placeholder="100000"
                  value={filters.amountRange?.max || ''}
                  onChange={(e) => handleFilterChange('amountRange', { 
                    ...filters.amountRange, 
                    max: e.target.value 
                  })}
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 z-50 mt-2 w-80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Filter Options</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange('dateRange', { 
                    ...filters.dateRange, 
                    start: e.target.value 
                  })}
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange('dateRange', { 
                    ...filters.dateRange, 
                    end: e.target.value 
                  })}
                />
              </div>
            </div>

            <Separator />

            {/* Module-specific filters */}
            {renderModuleSpecificFilters()}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
