import { useRef } from "react";
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

  return { blocker, allowNextNavigation };
}
