import { useEffect, useRef, useState } from "react";
import { Loader2, Search, Sparkles, X } from "lucide-react";
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

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  resident: { icon: "👤", label: "Residents", color: "bg-blue-100 text-blue-800" },
  staff: { icon: "👨‍💼", label: "Staff", color: "bg-green-100 text-green-800" },
  leave_request: { icon: "🗓️", label: "Leave", color: "bg-green-100 text-green-800" },
  medical_record: { icon: "🏥", label: "Medical", color: "bg-red-100 text-red-800" },
  prescription: { icon: "💊", label: "Prescriptions", color: "bg-purple-100 text-purple-800" },
  invoice: { icon: "💰", label: "Invoices", color: "bg-yellow-100 text-yellow-800" },
  payment: { icon: "💳", label: "Payments", color: "bg-yellow-100 text-yellow-800" },
  document: { icon: "📄", label: "Documents", color: "bg-gray-100 text-gray-800" },
  document_chunk: { icon: "📄", label: "Document text", color: "bg-gray-100 text-gray-800" },
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
          placeholder="Search anything, e.g. “residents with diabetes”"
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
          <Card className="max-h-[28rem] overflow-y-auto shadow-lg border-border">
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
                  const meta = TYPE_META[result.type] ?? { icon: "📋", label: result.type, color: "bg-gray-100 text-gray-800" };
                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        onResultClick?.(result);
                        clearSearch();
                      }}
                    >
                      <div className="text-lg flex-shrink-0">{meta.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{result.title}</p>
                          <Badge variant="outline" className={`text-xs ${meta.color} flex-shrink-0`}>
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{result.snippet}</p>
                      </div>
                    </div>
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
