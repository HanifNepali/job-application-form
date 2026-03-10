import { Sidebar, SidebarTrigger } from "@/components/Sidebar";
import { Stepper } from "@/components/Stepper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider } from "@/providers/SidebarContext";
import { Outlet } from "react-router-dom";

// Shared shell for every step route. Router renders this once and swaps
// only the <Outlet /> content when navigating between steps — so anything
// that should persist across steps (stepper, theme toggle) lives here,
// not inside individual step components.
//
// The Stepper itself isn't wired in yet — that's for a later phase
export function FormLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-canvas">
        <header className="relative z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-3 nav:hidden">
          <span className="font-semibold text-ink">Job Application</span>
          <SidebarTrigger />
        </header>

        <div className="flex">
          <Sidebar>
            <div className="mt-2">
              <Stepper />
            </div>
            <div className="mt-auto pt-8 border-t border-line">
              <ThemeToggle />
            </div>
          </Sidebar>

          <main className="min-w-0 flex-1 p-6 nav:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
