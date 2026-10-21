import { Link, useLocation } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DoorMark } from "@/components/AppSidebar";

/** 404: a stretch of corridor wall with an empty number plate where a door should be. */
const NotFound = () => {
  useDocumentTitle("Page not found");
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex min-h-svh flex-col px-[var(--gutter)] py-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">
        Skip to content
      </a>
      <Link to={user ? "/dashboard" : "/login"} className="brand-link flex w-fit items-center gap-2.5 rounded-sm" aria-label="SilverSync home">
        <DoorMark />
        <span className="text-lg font-extrabold tracking-[-0.03em]">SilverSync</span>
      </Link>

      <main id="main" className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col justify-center gap-12 py-16">
        <div className="notfound-wall" aria-hidden="true">
          <span className="door-chip__no notfound-plate">?</span>
          <span className="notfound-outline" />
        </div>
        <div className="max-w-xl space-y-5">
          <p className="font-mono text-sm text-muted-foreground">404 · {location.pathname}</p>
          <h1 className="text-display">There is no room here.</h1>
          <p className="text-lg">This corridor ends at a wall. The page may have moved, or the link was mistyped.</p>
          <Link to={user ? "/dashboard" : "/login"} className="arrow-host arrow-back btn-swing inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 font-bold text-primary-foreground">
            <ArrowLeft className="arrow h-4 w-4" aria-hidden="true" />
            {user ? "Back to the house" : "Back to sign in"}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
