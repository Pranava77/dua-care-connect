import type { CSSProperties } from "react";

// Every resident is shown by their room's door. Dementia-friendly homes paint each resident's
// door its own colour so they can find home; the app uses the same colour wherever they appear.
// Colours are tied to the room (the physical door), so they stay stable for a resident.

export interface DoorColour {
  name: string;
  bg: string;
  fg: string; // AA on bg (checked: every pair is at least 6:1)
}

const DOORS: DoorColour[] = [
  { name: "plum", bg: "#6E2A73", fg: "#FFFFFF" },
  { name: "teal", bg: "#0E6A73", fg: "#FFFFFF" },
  { name: "slate", bg: "#3E4A61", fg: "#FFFFFF" },
  { name: "rust", bg: "#A8430F", fg: "#FFFFFF" },
  { name: "red", bg: "#A3261C", fg: "#FFFFFF" },
  { name: "blue", bg: "#1F4FAE", fg: "#FFFFFF" },
  { name: "ochre", bg: "#E2B23A", fg: "#131B18" },
  { name: "green", bg: "#1E6B47", fg: "#FFFFFF" },
];

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Room "103" → floor 1, door 3. Neighbouring doors on a floor never share a colour. */
export function doorFor(room?: string | null): DoorColour {
  const n = Number(room);
  if (room && Number.isInteger(n) && n >= 100) {
    return DOORS[(Math.floor(n / 100) * 3 + (n % 100)) % DOORS.length];
  }
  return DOORS[hash(room ?? "") % DOORS.length];
}

export const floorOf = (room: string): string => {
  const n = Number(room);
  return Number.isInteger(n) && n >= 100 ? String(Math.floor(n / 100)) : "Other";
};

export const doorStyle = (room?: string | null) => {
  const d = doorFor(room);
  return { "--door": d.bg, "--door-ink": d.fg } as CSSProperties;
};
