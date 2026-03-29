import { useReducedMotion, type Variants } from "motion/react";

interface StaggerOptions {
  staggerChildren?: number;
}

/**
 * A container's stagger timing only — says nothing about how each
 * child actually animates. Pair with useFadeUp (or any other
 * per-child variant) on the children themselves.
 */
export function useStagger({
  staggerChildren = 0.08,
}: StaggerOptions = {}): Variants {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return { hidden: {}, visible: {} };
  }

  return {
    hidden: {},
    visible: { transition: { staggerChildren } },
  };
}

interface FadeUpOptions {
  duration?: number;
  yOffset?: number;
}

/**
 * A single element's fade-up-into-view animation. Usable standalone
 * (one element, no group) or as the "item" variant handed to a parent
 * using useStagger — this hook only ever concerns itself with how one
 * element animates, never how it's timed relative to siblings.
 */
export function useFadeUp({
  duration = 0.4,
  yOffset = 12,
}: FadeUpOptions = {}): Variants {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return { hidden: { opacity: 1 }, visible: { opacity: 1 } };
  }

  return {
    hidden: { opacity: 0, y: yOffset },
    visible: { opacity: 1, y: 0, transition: { duration, ease: "easeOut" } },
  };
}

export function useModalMotion() {
  const shouldReduceMotion = useReducedMotion();

  const backdrop: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      };

  const modal: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, scale: 1, y: 0 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 1, scale: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 1, y: 25 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0.2, ease: "easeOut" },
        },
        exit: {
          opacity: 0,
          scale: 1,
          y: 25,
          transition: { duration: 0.15, ease: "easeIn" },
        },
      };

  return { backdrop, modal };
}
