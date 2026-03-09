import { Link, useLocation } from "react-router-dom";
import { STEPS } from "@/lib/steps";
import { useFormStore } from "@/store/formStore";

// Bare-bones step indicator for Phase 1: shows all steps, highlights the
// active one, and lets the user manually click between steps. No visual
// progress-bar styling yet (Phase 2/5 polish) and no route guard yet
// (Phase 4) — every step link is clickable regardless of furthestUnlockedStep
// for now, since there's nothing to validate against until Phase 3 exists.
export function Stepper() {
  const location = useLocation();
  const furthestUnlockedStep = useFormStore(
    (state) => state.furthestUnlockedStep,
  );

  return (
    <nav aria-label="Form steps">
      {/* "Step X of Y" label, called out explicitly in the spec for
          screen-reader users who may not benefit from the visual list alone */}
      <p>
        Step{STEPS.findIndex((s) => location.pathname.endsWith(s.path)) + 1}of
        {""} {STEPS.length}
      </p>
      <ol>
        {STEPS.map((step, index) => {
          const isActive = location.pathname.endsWith(step.path);
          // Reachability preview only — not enforced yet. Phase 4's route
          // guard is what actually blocks navigation; this just dims
          // steps that aren't reachable so the UI isn't misleading in
          // the meantime.
          const isReachable = index <= furthestUnlockedStep;

          return (
            <li key={step.id}>
              <Link
                to={`/form/${step.path}`}
                // aria-current="step" on the active step, per spec, so
                // screen readers announce which step is current.
                aria-current={isActive ? "step" : undefined}
                aria-disabled={!isReachable}
                className={
                  isActive ? "text-blue-800 font-bold" : "text-gray-800"
                }
              >
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
