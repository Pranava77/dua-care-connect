import { useState, useEffect, useRef } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  type: 'resident' | 'staff' | 'medical' | 'prescription' | 'invoice' | 'document';
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  category?: string;
}

interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({ onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<{
    residents: boolean;
    staff: boolean;
    medical: boolean;
    prescriptions: boolean;
    invoices: boolean;
    documents: boolean;
  }>({
    residents: true,
    staff: true,
    medical: true,
    prescriptions: true,
    invoices: true,
    documents: true,
  });
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search residents
      if (filters.residents) {
        const { data: residents } = await mockApi.getResidents();
        const residentMatches = residents?.filter(resident =>
          resident.name.toLowerCase().includes(query.toLowerCase()) ||
          resident.room_number.toLowerCase().includes(query.toLowerCase()) ||
          resident.emergency_contact.toLowerCase().includes(query.toLowerCase())
        ) || [];

        residentMatches.forEach(resident => {
          searchResults.push({
            id: resident.id,
            type: 'resident',
            title: resident.name,
            subtitle: `Room ${resident.room_number}`,
            description: `Emergency: ${resident.emergency_contact}`,
            url: '/residents',
            category: 'Residents'
          });
        });
      }

      // Search staff
      if (filters.staff) {
        const { data: staff } = await mockApi.getStaff();
        const staffMatches = staff?.filter(member =>
          member.name.toLowerCase().includes(query.toLowerCase()) ||
          member.position.toLowerCase().includes(query.toLowerCase()) ||
          member.department.toLowerCase().includes(query.toLowerCase()) ||
          member.email.toLowerCase().includes(query.toLowerCase())
        ) || [];

        staffMatches.forEach(member => {
          searchResults.push({
            id: member.id,
            type: 'staff',
            title: member.name,
            subtitle: `${member.position} - ${member.department}`,
            description: member.email,
            url: '/hr',
            category: 'Staff'
          });
        });
      }

      // Search medical records
      if (filters.medical) {
        const { data: medicalRecords } = await mockApi.getMedicalRecords();
        const medicalMatches = medicalRecords?.filter(record =>
          record.diagnosis.toLowerCase().includes(query.toLowerCase()) ||
          record.treatment.toLowerCase().includes(query.toLowerCase()) ||
          record.doctor.toLowerCase().includes(query.toLowerCase()) ||
          record.residents?.name.toLowerCase().includes(query.toLowerCase())
        ) || [];

        medicalMatches.forEach(record => {
          searchResults.push({
            id: record.id,
            type: 'medical',
            title: record.diagnosis,
            subtitle: `${record.residents?.name} - ${record.doctor}`,
            description: record.treatment,
            url: '/medical',
            category: 'Medical Records'
          });
        });
      }

      // Search prescriptions
      if (filters.prescriptions) {
        const { data: prescriptions } = await mockApi.getPrescriptions();
        const prescriptionMatches = prescriptions?.filter(prescription =>
          prescription.medication.toLowerCase().includes(query.toLowerCase()) ||
          prescription.prescribing_doctor.toLowerCase().includes(query.toLowerCase()) ||
          prescription.residents?.name.toLowerCase().includes(query.toLowerCase())
        ) || [];

        prescriptionMatches.forEach(prescription => {
          searchResults.push({
            id: prescription.id,
            type: 'prescription',
            title: prescription.medication,
            subtitle: `${prescription.residents?.name} - ${prescription.prescribing_doctor}`,
            description: `${prescription.dosage} - ${prescription.frequency}`,
            url: '/medical',
            category: 'Prescriptions'
          });
        });
      }

      // Search invoices
      if (filters.invoices) {
        const { data: invoices } = await mockApi.getInvoices();
        const invoiceMatches = invoices?.filter(invoice =>
          invoice.invoice_number.toLowerCase().includes(query.toLowerCase()) ||
          invoice.resident_name.toLowerCase().includes(query.toLowerCase()) ||
          invoice.status.toLowerCase().includes(query.toLowerCase())
        ) || [];

        invoiceMatches.forEach(invoice => {
          searchResults.push({
            id: invoice.id,
            type: 'invoice',
            title: `Invoice ${invoice.invoice_number}`,
            subtitle: invoice.resident_name,
            description: `£${invoice.amount} - ${invoice.status}`,
            url: '/accounting',
            category: 'Invoices'
          });
        });
      }

      // Search documents
      if (filters.documents) {
        const { data: documents } = await mockApi.getDocuments();
        const documentMatches = documents?.filter(doc =>
          doc.name.toLowerCase().includes(query.toLowerCase()) ||
          doc.category.toLowerCase().includes(query.toLowerCase()) ||
          doc.resident_name?.toLowerCase().includes(query.toLowerCase())
        ) || [];

        documentMatches.forEach(doc => {
          searchResults.push({
            id: doc.id,
            type: 'document',
            title: doc.name,
            subtitle: doc.category,
            description: doc.resident_name ? `Resident: ${doc.resident_name}` : undefined,
            url: '/documents',
            category: 'Documents'
          });
        });
      }

      setResults(searchResults.slice(0, 20)); // Limit to 20 results
      setShowResults(true);
    } catch (error: any) {
      toast.error("Search failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resident':
        return '👤';
      case 'staff':
        return '👨‍💼';
      case 'medical':
        return '🏥';
      case 'prescription':
        return '💊';
      case 'invoice':
        return '💰';
      case 'document':
        return '📄';
      default:
        return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resident':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'prescription':
        return 'bg-purple-100 text-purple-800';
      case 'invoice':
        return 'bg-yellow-100 text-yellow-800';
      case 'document':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search across all modules..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 w-full"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-card border border-border rounded-md shadow-lg z-[100]">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Search in:</span>
            {Object.entries(filters).map(([key, enabled]) => (
              <Badge
                key={key}
                variant={enabled ? "default" : "outline"}
                className="cursor-pointer hover:bg-muted"
                onClick={() => toggleFilter(key as keyof typeof filters)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-[100] mt-1">
          <Card className="max-h-96 overflow-y-auto shadow-lg border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {loading ? "Searching..." : `${results.length} results found`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {results.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        onResultClick?.(result);
                        clearSearch();
                      }}
                    >
                      <div className="text-lg flex-shrink-0">{getTypeIcon(result.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{result.title}</p>
                          <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)} flex-shrink-0`}>
                            {result.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
