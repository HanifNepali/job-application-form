import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { Blocker } from "react-router-dom";
import { Button } from "@/components/Button";
import { useFocusTrap } from "@/lib/hooks";
import { useModalMotion } from "@/lib/motionVariants";

interface UnsavedChangesModalProps {
  blocker: Blocker;
}

export function UnsavedChangesModal({ blocker }: UnsavedChangesModalProps) {
  const isOpen = blocker.state === "blocked";
  const { backdrop, modal } = useModalMotion();

  // For accessibility, we use useFocusTrap to trap focus within the modal
  // Please refer to the useFocusTrap hook implementation in src/lib/hooks.ts for details on how it works.
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, {
    initialFocusSelector: "[data-autofocus]",
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") blocker.reset?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, blocker]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => blocker.reset?.()}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdrop}
        >
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unsaved-changes-title"
            aria-describedby="unsaved-changes-description"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-card"
            variants={modal}
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
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p
              id="unsaved-changes-description"
              className="text-sm text-ink-secondary"
            >
              You have unsaved changes on this step. If you leave now, they'll
              be lost.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                data-autofocus
                onClick={() => blocker.reset?.()}
              >
                Stay on this page
              </Button>
              <Button variant="primary" onClick={() => blocker.proceed?.()}>
                Leave without saving
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
