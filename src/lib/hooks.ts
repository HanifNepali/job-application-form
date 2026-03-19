import { useRef, useEffect } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChangesWarning(isDirty: boolean) {
  const skipNextBlockRef = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (skipNextBlockRef.current) return false;
    return isDirty && currentLocation.pathname !== nextLocation.pathname;
  });

  const allowNextNavigation = () => {
    skipNextBlockRef.current = true;
  };

  // Tab close / refresh / typing a new URL — none of these go through
  // React Router at all, so useBlocker (above) can't see or stop them.
  // This is the browser's own separate mechanism: calling
  // preventDefault() here is what triggers its native "leave site?" dialog.
  // We cannot customize its text, buttons, or styling
  // that's a hard platform restriction, not a scoping choice.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return { blocker, allowNextNavigation };
}

const FOCUSABLE_SELECTOR = `a[href], button:not([disabled]), textarea:not([disabled]),
  input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])`;

interface UseFocusTrapOptions {
  /** CSS selector for the element to focus first. Falls back to the
   *  first focusable element in the container if omitted or not found. */
  initialFocusSelector?: string;
}

export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean,
  options: UseFocusTrapOptions = {},
) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const { initialFocusSelector } = options;

  useEffect(() => {
    if (!isActive) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    // Creates an array of all focusable elements within the container, in DOM order.
    // return [] if "container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)" matches nothing
    const getFocusableElements = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    // Move focus inside immediately — container itself as a fallback if
    // it happens to contain no focusable children yet.

    const preferredTarget = initialFocusSelector
      ? container.querySelector<HTMLElement>(initialFocusSelector)
      : null;

    const focusableElements = getFocusableElements();

    const target = preferredTarget ?? focusableElements[0] ?? container;
    target.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      // Wrap manually — cycling Tab past the last element back to the
      // first, and Shift+Tab past the first back to the last, is what
      // actually makes it a "trap" rather than just an initial focus push.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus(); // return focus to wherever it came from
    };
  }, [isActive, initialFocusSelector]);

  return containerRef;
}
