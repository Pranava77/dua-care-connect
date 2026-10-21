import { useEffect, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardSummary } from "@/hooks/queries/reports";
import { useResidents } from "@/hooks/queries/residents";
import { useAlerts } from "@/hooks/queries/ai";
import { Corridor } from "@/features/corridor/Corridor";
import { AiAlertsCard } from "@/features/ai-reports/AiAlertsCard";
import { DoorChip } from "@/components/door/DoorChip";
import { firstName, greeting } from "@/lib/people";
import { hasPermission } from "@/lib/rbac";

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { user } = useAuth();
  const now = useNow();
  const { data: summary } = useDashboardSummary();
  const { data: residents = [], isLoading } = useResidents();
  const { data: alerts = [] } = useAlerts();

  const roomsNeeding = new Set(alerts.filter((a) => a.resident_id).map((a) => a.resident_id)).size;
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const facts = [
    { label: "Residents", value: summary?.residents, href: "/residents", permission: "residents:read" as const },
    { label: "Medical records", value: summary?.medicalCases, href: "/medical", permission: "medical:read" as const },
    { label: "Prescriptions", value: summary?.prescriptions, href: "/medical", permission: "medical:read" as const },
    { label: "Staff", value: summary?.staff, href: "/hr", permission: "hr:read" as const },
  ];

  return (
    <div className="space-y-14">
      <header className="grid gap-4 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="font-mono text-sm text-muted-foreground">
            <time dateTime={now.toISOString()}>{date} · {time}</time>
          </p>
          <h1 className="text-display mt-3">
            {greeting(now.getHours())}, {user ? firstName(user.name) : "there"}.
          </h1>
        </div>
        <p className="text-lg md:col-span-4 md:text-right md:pb-1.5">
          {roomsNeeding === 0
            ? "Every call light is off."
            : `${roomsNeeding} ${roomsNeeding === 1 ? "room needs" : "rooms need"} you today.`}
        </p>
      </header>

      <section aria-labelledby="the-house" className="space-y-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="the-house" className="text-headline-2">The house</h2>
          <p className="pointer-only text-sm text-muted-foreground">
            Point at a door to look in. A lit call light means the room needs someone.
          </p>
        </div>
        {isLoading ? (
          <div className="corridor-skeleton rounded-lg bg-muted/60" aria-hidden="true" />
        ) : (
          <Corridor residents={residents} alerts={alerts} />
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <AiAlertsCard />
        </div>

        <aside className="min-w-0 space-y-10 lg:col-span-4" aria-label="At a glance">
          <section aria-labelledby="glance" className="space-y-4">
            <h2 id="glance" className="text-headline-2">At a glance</h2>
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border" role="list">
              {facts.map((f) => {
                const body = (
                  <>
                    <span className="text-sm text-muted-foreground">{f.label}</span>
                    <span className="flex items-end justify-between gap-2">
                      <span className="font-mono text-4xl font-bold tracking-[-0.04em] tabular">{f.value ?? "…"}</span>
                    </span>
                  </>
                );
                return (
                  <li key={f.label} className="bg-card">
                    {hasPermission(user, f.permission) ? (
                      <Link to={f.href} className="arrow-host group flex h-full flex-col gap-1 p-4 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60">
                        {body}
                        <ArrowRight className="arrow -mt-6 ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    ) : (
                      <div className="flex h-full flex-col gap-1 p-4">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="newest" className="space-y-4">
            <h2 id="newest" className="text-headline-2">Newest residents</h2>
            <ul className="space-y-3" role="list">
              {(summary?.recentResidents ?? []).map((r) => (
                <li key={r.id}>
                  <Link to={`/residents/${r.id}`} className="door-row flex items-center justify-between gap-3 rounded-md py-1">
                    <DoorChip residentId={r.id} room={r.room_number} name={r.name} />
                    <span className="font-mono text-xs text-muted-foreground tabular">
                      since {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
