import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";

const DOOR_NAME = "resident-door";

/**
 * Walk through a door: navigates to a resident page with a shared-element view transition, so the
 * clicked door becomes the door at the top of the resident's page. Without a door it cross-fades
 * between pages (used by the directory). Falls back to a plain navigation without View
 * Transitions support or under reduced motion.
 */
export function useDoorNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (to: string, door?: HTMLElement | null) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!document.startViewTransition || reduced) {
        navigate(to);
        return;
      }
      if (door) door.style.viewTransitionName = DOOR_NAME;
      const transition = document.startViewTransition(() => {
        if (door) door.style.viewTransitionName = "";
        flushSync(() => navigate(to));
      });
      transition.finished.finally(() => {
        if (door) door.style.viewTransitionName = "";
      });
    },
    [navigate],
  );
}

export const residentDoorTransitionName = DOOR_NAME;
