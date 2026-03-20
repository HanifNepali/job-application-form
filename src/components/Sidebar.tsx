import { type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useSidebar } from "@/providers/SidebarContext";
import { useFocusTrap } from "@/lib/hooks";

export function SidebarTrigger() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? "Close step navigation" : "Open step navigation"}
      aria-expanded={isOpen}
      aria-controls="form-sidebar"
      className="rounded-md p-2 text-ink nav:hidden focus-visible:outline focus-visible:outline-accent cursor-pointer"
    >
      {isOpen ? (
        <X className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Menu className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

export function Sidebar({ children }: { children: ReactNode }) {
  const { isOpen, close } = useSidebar();

  // For accessibility, we use useFocusTrap to trap focus within the sidebar
  // Please refer to the useFocusTrap hook implementation in src/lib/hooks.ts for details on how it works.
  const containerRef = useFocusTrap<HTMLElement>(isOpen, {
    initialFocusSelector: "[data-autofocus]",
  });

  return (
    <>
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-20 bg-black/50 nav:hidden"
        />
      )}

      <aside
        id="form-sidebar"
        ref={containerRef}
        className={`flex flex-col fixed inset-y-0 left-0 z-30 w-80 border-r border-line
      bg-surface p-6 transition-transform duration-200 ease-in-out
      nav:sticky nav:top-0 nav:translate-x-0 nav:shrink-0 nav:h-screen
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {children}
      </aside>
    </>
  );
}
