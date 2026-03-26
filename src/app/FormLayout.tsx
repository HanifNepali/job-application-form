import { Button } from "@/components/Button";
import { Sidebar, SidebarTrigger } from "@/components/Sidebar";
import { Stepper } from "@/components/Stepper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { STEPS } from "@/lib/steps";
import { SidebarProvider } from "@/providers/SidebarContext";
import { useFormStore } from "@/store/formStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function FormLayout() {
  //  ROUTE GUARD:
  // if the user tries to navigate directly to a step they haven't unlocked yet,
  // redirect them to the furthest unlocked step.
  const location = useLocation();
  const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

  const currentPath = location.pathname.replace("/form/", "");
  const currentIndex = STEPS.findIndex((s) => s.path === currentPath);

  if (currentIndex !== -1 && currentIndex > furthestUnlockedStep) {
    return (
      <Navigate to={`/form/${STEPS[furthestUnlockedStep].path}`} replace />
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-canvas">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          <Button variant="outline">Skip to main content</Button>
        </a>
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

          <main id="main-content" className="min-w-0 flex-1 p-6 nav:p-16">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
