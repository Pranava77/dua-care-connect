import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { GlobalSearch } from "./GlobalSearch";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { AssistantProvider, useAssistant } from "@/features/assistant/AssistantProvider";
import { lazy, Suspense, useEffect, useState } from "react";

// The assistant (and its Markdown renderer) loads the first time it is opened.
const AssistantPanel = lazy(() => import("@/features/assistant/AssistantPanel").then((m) => ({ default: m.AssistantPanel })));

function LazyAssistant() {
  const { isOpen } = useAssistant();
  const [wanted, setWanted] = useState(false);
  useEffect(() => { if (isOpen) setWanted(true); }, [isOpen]);
  return wanted ? <Suspense fallback={null}><AssistantPanel /></Suspense> : null;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AssistantProvider>
      <LayoutShell>{children}</LayoutShell>
      <LazyAssistant />
    </AssistantProvider>
  );
}

function AssistantButton() {
  const { setOpen } = useAssistant();
  return (
    <Button size="sm" className="gap-2 flex-none" onClick={() => setOpen(true)} aria-label="Ask the assistant">
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">Ask the assistant</span>
    </Button>
  );
}

function LayoutShell({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchResultClick = (result: any) => {
    navigate(result.url);
  };

  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-16 border-b border-border bg-background flex items-center gap-3 px-[var(--gutter)]">
            <SidebarTrigger className="btn-plate h-9 w-9 flex-none" aria-label="Toggle directory" />
            <div className="flex min-w-0 flex-1 justify-center md:justify-start md:pl-4">
              <GlobalSearch onResultClick={handleSearchResultClick} />
            </div>
            <AssistantButton />
          </header>
          <main
            id="main"
            tabIndex={-1}
            key={location.pathname}
            className="page-enter flex-1 w-full max-w-[1320px] mx-auto px-[var(--gutter)] pt-10 pb-20 outline-none"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
