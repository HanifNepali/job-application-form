import { Link, useLocation } from "react-router-dom";
import { STEPS } from "@/lib/steps";
import { useFormStore } from "@/store/formStore";
import { useSidebar } from "@/providers/SidebarContext";
import { motion, useReducedMotion } from "motion/react";
import { useStagger, useFadeUp } from "@/lib/motionVariants";

export function Stepper() {
  const location = useLocation();
  const { close } = useSidebar();
  const furthestUnlockedStep = useFormStore(
    (state) => state.furthestUnlockedStep,
  );
  const currentIndex = STEPS.findIndex((s) =>
    location.pathname.endsWith(s.path),
  );

  const container = useStagger({ staggerChildren: 0.25 });
  const item = useFadeUp({ duration: 0.35, yOffset: 15 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav aria-label="Form steps">
      <p className="mb-6 text-xs font-medium uppercase tracking-wide text-ink-muted">
        Step {currentIndex + 1} of {STEPS.length}
      </p>

      <motion.ol initial="hidden" animate="visible" variants={container}>
        {STEPS.map((step, index) => {
          const isActiveStep = location.pathname.endsWith(step.path);
          const isReachableStep = index <= furthestUnlockedStep;
          const isLineReached = index < furthestUnlockedStep;
          const isLastStep = index === STEPS.length - 1;

          return (
            <motion.li
              variants={item}
              key={step.id}
              className="relative pb-20 last:pb-0"
            >
              {!isLastStep && (
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-8 h-full w-px"
                >
                  <motion.span
                    className="block h-full w-full bg-accent"
                    style={{ transformOrigin: "top" }}
                    initial={{ scaleY: 0 }} // 1. Force initial state to 0
                    animate={{ scaleY: isLineReached ? 1 : 0 }} // 2. Explicitly toggle 0 and 1
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 2.75, ease: "easeOut" }
                    }
                  />
                </span>
              )}

              <Link
                to={`/form/${step.path}`}
                onClick={close}
                data-autofocus={isActiveStep ? true : undefined}
                aria-current={isActiveStep ? "step" : undefined}
                aria-disabled={!isReachableStep}
                className={`relative z-10 flex items-center gap-3 rounded-md
                  focus-visible:outline
                  focus-visible:outline-offset-2 focus-visible:outline-accent
                  ${!isReachableStep ? "cursor-not-allowed" : ""}`}
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center
                    rounded-full border text-sm font-medium
                    ${
                      isActiveStep
                        ? "border-accent bg-accent text-accent-text"
                        : isReachableStep
                          ? "border-ink bg-surface text-ink"
                          : "border-line bg-surface text-ink-muted"
                    }`}
                >
                  {index + 1}
                </span>

                <span className="flex flex-col">
                  <span
                    className={
                      isActiveStep
                        ? "font-semibold text-ink"
                        : isReachableStep
                          ? "text-ink"
                          : "text-ink-muted"
                    }
                  >
                    {step.label}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {step.description}
                  </span>
                </span>
              </Link>
            </motion.li>
          );
        })}
      </motion.ol>
    </nav>
  );
}
