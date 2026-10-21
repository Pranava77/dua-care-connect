import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Renders model-generated Markdown (no raw HTML is allowed through). */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5",
        // Follow the app's theme tokens so text stays legible in both light and dark mode.
        "[--tw-prose-body:hsl(var(--foreground))] [--tw-prose-headings:hsl(var(--foreground))]",
        "[--tw-prose-bold:hsl(var(--foreground))] [--tw-prose-links:hsl(var(--primary))]",
        "[--tw-prose-bullets:hsl(var(--muted-foreground))] [--tw-prose-counters:hsl(var(--muted-foreground))]",
        "[--tw-prose-th-borders:hsl(var(--border))] [--tw-prose-td-borders:hsl(var(--border))]",
        "[--tw-prose-code:hsl(var(--foreground))] [--tw-prose-quotes:hsl(var(--muted-foreground))]",
        "prose-table:text-xs prose-th:px-2 prose-td:px-2 prose-headings:mt-3 prose-headings:mb-1.5",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
