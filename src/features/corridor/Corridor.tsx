import { useRef } from "react";
import { Door } from "@/components/door/Door";
import { floorOf } from "@/lib/doors";
import { ageFrom } from "@/lib/people";
import { useDoorNavigate } from "@/hooks/useDoorNavigate";
import type { AlertItem, Resident } from "@/lib/types";

interface CorridorProps {
  residents: Resident[];
  alerts?: AlertItem[];
  size?: "md" | "lg";
}

/** The house drawn as corridors: one row of doors per floor, top floor first, like a building
 * section. A door swings open on hover or focus to show what that room needs; a call light
 * glows over rooms that need someone; clicking walks through the door into the resident's page. */
export function Corridor({ residents, alerts = [], size = "lg" }: CorridorProps) {
  const floors = new Map<string, Resident[]>();
  for (const r of [...residents].sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true }))) {
    const f = floorOf(r.room_number);
    floors.set(f, [...(floors.get(f) ?? []), r]);
  }
  const ordered = [...floors.entries()].sort(([a], [b]) => (a === "Other" ? 1 : b === "Other" ? -1 : Number(b) - Number(a)));

  return (
    <div className="corridor">
      {ordered.map(([floor, rooms]) => (
        <div key={floor} className="corridor__floor">
          <div className="corridor__sign">
            <span className="sign-label">{floor === "Other" ? "Other rooms" : `Floor ${floor}`}</span>
            <span className="font-mono text-xs text-muted-foreground tabular">
              {rooms.length === 1 ? `Room ${rooms[0].room_number}` : `Rooms ${rooms[0].room_number} to ${rooms[rooms.length - 1].room_number}`}
            </span>
          </div>
          <ul className="corridor__doors" role="list">
            {rooms.map((r) => (
              <li key={r.id}>
                <CorridorDoor resident={r} needs={alerts.filter((a) => a.resident_id === r.id)} size={size} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CorridorDoor({ resident, needs, size }: { resident: Resident; needs: AlertItem[]; size: "md" | "lg" }) {
  const doorRef = useRef<HTMLDivElement>(null);
  const walkThrough = useDoorNavigate();
  const href = `/residents/${resident.id}`;
  const urgent = needs.some((n) => n.severity !== "low");
  const caption = needs.length ? `${needs.length} ${needs.length === 1 ? "need" : "needs"}` : "All well";

  return (
    <a
      href={href}
      className="door-host corridor__door"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        walkThrough(href, doorRef.current);
      }}
    >
      <Door
        ref={doorRef}
        room={resident.room_number}
        name={resident.name}
        call={needs.length > 0}
        size={size}
        behind={
          <>
            <span className="font-bold leading-tight">{resident.name}</span>
            <span className="text-muted-foreground">{ageFrom(resident.date_of_birth)} years</span>
            {needs.length ? (
              <ul className="space-y-1">
                {needs.slice(0, 3).map((n, i) => (
                  <li key={i} className="flex gap-1.5 leading-snug">
                    <span className={`mt-[0.4em] h-1.5 w-1.5 flex-none rounded-full ${n.severity === "low" ? "bg-muted-foreground" : "bg-call"}`} />
                    {n.title.replace(` for ${resident.name}`, "")}
                  </li>
                ))}
              </ul>
            ) : (
              <span>{resident.medical_conditions.join(", ") || "No conditions recorded"}</span>
            )}
          </>
        }
      />
      <span className={`corridor__caption ${urgent ? "is-urgent" : ""}`}>
        {caption}
      </span>
    </a>
  );
}
