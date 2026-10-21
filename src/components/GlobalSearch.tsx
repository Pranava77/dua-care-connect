import { useEffect, useRef, useState } from "react";
import { CalendarDays, FileText, HeartPulse, Loader2, Pill, PoundSterling, Search, Sparkles, UserCog, Users, X } from "lucide-react";
import { DoorChip } from "@/components/door/DoorChip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSemanticSearch } from "@/features/ai-search/useSemanticSearch";
import { useAssistant } from "@/features/assistant/AssistantProvider";
import type { SearchHit } from "@/lib/types";

// Semantic hit types grouped into the filter chips shown to the user.
const FILTER_TYPES = {
  residents: ["resident"],
  staff: ["staff", "leave_request"],
  medical: ["medical_record"],
  prescriptions: ["prescription"],
  invoices: ["invoice", "payment"],
  documents: ["document", "document_chunk"],
} as const;

type FilterKey = keyof typeof FILTER_TYPES;

const TYPE_META: Record<string, { label: string; Icon: typeof FileText }> = {
  resident: { label: "Resident", Icon: Users },
  staff: { label: "Staff", Icon: UserCog },
  leave_request: { label: "Leave", Icon: CalendarDays },
  medical_record: { label: "Medical", Icon: HeartPulse },
  prescription: { label: "Prescription", Icon: Pill },
  invoice: { label: "Invoice", Icon: PoundSterling },
  payment: { label: "Payment", Icon: PoundSterling },
  document: { label: "Document", Icon: FileText },
  document_chunk: { label: "Document text", Icon: FileText },
};

interface GlobalSearchProps {
  onResultClick?: (result: SearchHit) => void;
}

export function GlobalSearch({ onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    residents: true, staff: true, medical: true, prescriptions: true, invoices: true, documents: true,
  });
  const searchRef = useRef<HTMLDivElement>(null);
  const { ask } = useAssistant();
  const { data: hits = [], isFetching, isError, error } = useSemanticSearch(query);

  const enabledTypes = new Set<string>(
    (Object.keys(filters) as FilterKey[]).filter((k) => filters[k]).flatMap((k) => FILTER_TYPES[k]),
  );
  const results = hits.filter((hit) => enabledTypes.has(hit.type));

  useEffect(() => {
    setShowResults(query.trim().length >= 2);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
  };

  const askAssistant = () => {
    ask(query.trim());
    clearSearch();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Find a resident or record"
          aria-label="Search residents, records and documents"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(query.trim().length >= 2)}
          onKeyDown={(e) => e.key === "Enter" && e.metaKey && askAssistant()}
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

      {showResults && (
        <div className="absolute top-full left-0 right-0 z-[100] mt-1">
          <Card className="max-h-[28rem] overflow-y-auto border-foreground/20 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)]">
            <CardHeader className="pb-2 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(filters) as FilterKey[]).map((key) => (
                  <Badge
                    key={key}
                    variant={filters[key] ? "default" : "outline"}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-sm flex items-center gap-2">
                {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                {isError ? "Search failed" : `${results.length} results`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <button
                type="button"
                onClick={askAssistant}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 text-left transition-colors border border-dashed border-primary/30"
              >
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm truncate">
                  Ask the assistant: <span className="font-medium">“{query.trim()}”</span>
                </span>
              </button>
              {isError ? (
                <div className="text-center text-sm text-destructive py-4">{(error as Error).message}</div>
              ) : results.length === 0 && !isFetching ? (
                <div className="text-center text-sm text-muted-foreground py-4">No matching records for "{query}"</div>
              ) : (
                results.map((result) => {
                  const meta = TYPE_META[result.type] ?? { label: result.type, Icon: FileText };
                  return (
                    <button
                      type="button"
                      key={`${result.type}-${result.id}`}
                      className="door-row flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60"
                      onClick={() => {
                        onResultClick?.(result);
                        clearSearch();
                      }}
                    >
                      {result.resident_id ? (
                        <DoorChip residentId={result.resident_id} showName={false} className="flex-none" />
                      ) : (
                        <span className="grid h-[2.1rem] w-[1.55rem] flex-none place-items-center text-muted-foreground" aria-hidden="true">
                          <meta.Icon className="h-4 w-4" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold">{result.title}</span>
                          <span className="sign-label flex-none text-[0.625rem] text-muted-foreground">{meta.label}</span>
                        </span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">{result.snippet}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
