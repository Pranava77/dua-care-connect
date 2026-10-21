import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { doorStyle } from "@/lib/doors";

interface DoorProps {
  room: string;
  name: string;
  /** Nurse-call light: on when the room needs someone. */
  call?: boolean;
  /** What is behind the door, shown when it swings open. */
  behind?: ReactNode;
  size?: "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}

const SIZES = {
  md: "w-[104px] h-[168px] text-[0.8125rem]",
  lg: "w-[148px] h-[236px] text-sm",
  xl: "w-[132px] h-[212px] md:w-[168px] md:h-[268px] text-base",
};

/** A resident's front door: coloured leaf, number plate, name, handle and call light. Purely visual;
 * wrap it in a `.door-host` link or button to make it swing open on hover and focus. */
export const Door = forwardRef<HTMLDivElement, DoorProps>(function Door(
  { room, name, call, behind, size = "md", className, style },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("door flex-none", SIZES[size], className)}
      data-call={call ? "on" : "off"}
      style={{ ...doorStyle(room), ...style }}
    >
      <span className="door__call" aria-hidden="true" />
      {behind && <div className="door__behind">{behind}</div>}
      <div className="door__leaf">
        <span className="door__plate">{room}</span>
        <span className="door__name">{name.split(" ")[0]}</span>
        <span className="door__handle" />
      </div>
    </div>
  );
});
