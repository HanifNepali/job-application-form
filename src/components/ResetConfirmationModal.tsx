import { useEffect } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/hooks";
import { Button } from "@/components/Button";

interface ResetConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
}: ResetConfirmModalProps) {
  // For accessibility, we use useFocusTrap to trap focus within the modal
  // Please refer to the useFocusTrap hook implementation in src/lib/hooks.ts for details on how it works.
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, {
    initialFocusSelector: "[data-autofocus]",
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        ref={containerRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-confirm-title"
        aria-describedby="reset-confirm-description"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-card"
      >
        <div className="mb-2 flex items-start justify-between">
          <h2
            id="reset-confirm-title"
            className="text-base font-semibold text-ink"
          >
            Clear all form progress?
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p
          id="reset-confirm-description"
          className="text-sm text-ink-secondary"
        >
          This will permanently erase all information you have entered across
          all steps. This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" data-autofocus onClick={onCancel}>
            Keep Editing
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
