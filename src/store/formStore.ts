import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialFormData, type FormData } from "@/types/form";

interface FormState {
  data: FormData;

  // Highest step *index* (into STEPS, see lib/steps.ts) navigation has
  // ever unlocked — i.e. what's reachable, NOT "currently valid." A step
  // can be unlocked (reachable by URL) while no longer passing validation
  // if an earlier step was edited afterward and broke something. The
  // Phase 4 route guard re-checks live validity separately and redirects
  // to the first invalid step regardless of this value; final submit
  // re-validates everything too. This value only ever grows — see
  // setFurthestUnlockedStep below for why.
  furthestUnlockedStep: number;

  // Each takes a Partial<> patch rather than the full sub-object, so a
  // step's form (via RHF's onChange/onBlur) can push individual field
  // changes without having to reconstruct the whole step's state each time.
  // Real validation-aware logic (e.g. bumping furthestValidStep only when
  // a step actually passes its Zod schema) comes in later
  updatePersonalInfo: (patch: Partial<FormData["personalInfo"]>) => void;
  updateExperience: (patch: Partial<FormData["experience"]>) => void;
  updateSkillsLinks: (patch: Partial<FormData["skillsLinks"]>) => void;
  updateAvailability: (patch: Partial<FormData["availability"]>) => void;
  updateReview: (patch: Partial<FormData["review"]>) => void;

  setFurthestUnlockedStep: (stepIndex: number) => void;

  // Clears all persisted form data back to blank. Wired to the Phase 5
  // "reset / start over" UI action; does NOT touch the file store, which
  // has its own reset (files are already lost on refresh regardless).
  reset: () => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      data: initialFormData,
      furthestUnlockedStep: 0,

      updatePersonalInfo: (patch) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, ...patch },
          },
        })),

      updateExperience: (patch) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: { ...state.data.experience, ...patch },
          },
        })),

      updateSkillsLinks: (patch) =>
        set((state) => ({
          data: {
            ...state.data,
            skillsLinks: { ...state.data.skillsLinks, ...patch },
          },
        })),

      updateAvailability: (patch) =>
        set((state) => ({
          data: {
            ...state.data,
            availability: { ...state.data.availability, ...patch },
          },
        })),

      updateReview: (patch) =>
        set((state) => ({
          data: { ...state.data, review: { ...state.data.review, ...patch } },
        })),

      setFurthestUnlockedStep: (stepIndex) =>
        set((state) => ({
          // Math.max: going back to fix step 2 and re-passing it must NOT
          // pull this backward from 4 down to 2 — it tracks the furthest
          // point ever unlocked, not the current step.
          furthestUnlockedStep: Math.max(state.furthestUnlockedStep, stepIndex),
        })),

      reset: () => set({ data: initialFormData, furthestUnlockedStep: 0 }),
    }),
    {
      name: "job-application-form", // localStorage key
      // everything in FormState above (data + furthestUnlockedStep) is safe to persist as-is
      // since actions are functions and aren't included in the persisted snapshot.
    },
  ),
);
