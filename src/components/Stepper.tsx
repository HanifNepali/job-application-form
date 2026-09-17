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
      <p className="mb-6 text-sm font-medium uppercase tracking-wide text-white/50">
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
                  className="absolute left-2 top-4 h-full w-px"
                >
                  <motion.span
                    className="block h-full w-full bg-accent-secondary/40"
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
                  focus-visible:outline-offset-2 focus-visible:outline-accent-secondary
                  ${!isReachableStep ? "pointer-events-none" : ""}`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center
                    rounded-full bg-sidebar border border-accent-secondary text-sm font-medium
                    ${
                      isActiveStep
                        ? "bg-accent-secondary/80!"
                        : isReachableStep
                          ? "text-accent-secondary/90"
                          : "border-white/50"
                    }`}
                >
                  {/* {index + 1} */}
                </span>

                <span className="flex flex-col">
                  <span
                    className={
                      isActiveStep
                        ? "font-bold text-accent-secondary"
                        : isReachableStep
                          ? "text-accent-secondary/85"
                          : "text-white/60"
                    }
                  >
                    {step.label}
                  </span>
                  <span className="text-sm text-stepper-description">
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
