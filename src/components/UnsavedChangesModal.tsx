import { useEffect } from "react";
import { X } from "lucide-react";
import type { Blocker } from "react-router-dom";
import { Button } from "@/components/Button";

interface UnsavedChangesModalProps {
  blocker: Blocker;
}

export function UnsavedChangesModal({ blocker }: UnsavedChangesModalProps) {
  const isOpen = blocker.state === "blocked";

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") blocker.reset?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, blocker]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => blocker.reset?.()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-description"
        onClick={(e) => e.stopPropagation()} // prevents a click inside the card from bubbling to the backdrop's close handler
        className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-card"
      >
        <div className="mb-2 flex items-start justify-between">
          <h2
            id="unsaved-changes-title"
            className="text-base font-semibold text-ink"
          >
            Unsaved changes
          </h2>
          <button
            type="button"
            onClick={() => blocker.reset?.()}
            aria-label="Close"
            className="text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p
          id="unsaved-changes-description"
          className="text-sm text-ink-secondary"
        >
          You have unsaved changes on this step. If you leave now, they'll be
          lost.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => blocker.reset?.()}>
            Stay on this page
          </Button>
          <Button variant="primary" onClick={() => blocker.proceed?.()}>
            Leave without saving
          </Button>
        </div>
      </div>
    </div>
  );
}
