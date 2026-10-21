import { useEffect } from "react";

/** Sets the tab title for a page, e.g. "Residents · SilverSync", so staff can tell tabs apart. */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · SilverSync` : "SilverSync · Care home operations";
  }, [title]);
}
