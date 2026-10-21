import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { doorStyle } from "@/lib/doors";
import { useResidents } from "@/hooks/queries/residents";

interface DoorChipProps {
  residentId?: string | null;
  name?: string | null;
  /** Room number; looked up from the residents directory when omitted. */
  room?: string | null;
  /** Link the chip to the resident's page. */
  link?: boolean;
  className?: string;
  showName?: boolean;
}

/** The resident's door at text size, used wherever a resident appears in a list. */
export const DoorChip = forwardRef<HTMLSpanElement, DoorChipProps>(function DoorChip(
  { residentId, name, room, link = false, className, showName = true },
  ref,
) {
  const { data: residents } = useResidents(!room && !!residentId);
  const resident = residents?.find((r) => r.id === residentId);
  const roomNo = room ?? resident?.room_number ?? null;
  const label = name ?? resident?.name ?? "Unknown resident";

  const content = (
    <>
      <span className="door-chip__leaf" aria-hidden="true">
        {roomNo && <span className="door-chip__no">{roomNo}</span>}
      </span>
      {showName && <span className="truncate font-semibold">{label}</span>}
      <span className="sr-only">{roomNo ? `, room ${roomNo}` : ""}</span>
    </>
  );

  if (link && residentId) {
    return (
      <Link to={`/residents/${residentId}`} className={cn("door-chip rounded-sm", className)} style={doorStyle(roomNo)}>
        {content}
      </Link>
    );
  }
  return (
    <span ref={ref} className={cn("door-chip", className)} style={doorStyle(roomNo)}>
      {content}
    </span>
  );
});
