import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { aiApi } from "@/lib/api/ai";
import { keys } from "@/hooks/queries/keys";

/** Debounced semantic search across every module the user may read (filtered server-side by role). */
export function useSemanticSearch(query: string, { delay = 300, k = 15 } = {}) {
  const [debounced, setDebounced] = useState(query.trim());

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  return useQuery({
    queryKey: [...keys.search, debounced, k],
    queryFn: ({ signal }) => aiApi.search(debounced, k, signal),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
