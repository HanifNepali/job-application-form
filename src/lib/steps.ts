// as const locks the array down to literal types,
// so StepId becomes the exact union 'personal-info' | 'experience' | ... instead of just string.
// That's what lets TypeScript catch typos later (e.g. in the store or route guard) if someone writes 'personal-infoo'.

// path is separate from id even though they're equal today
// if a URL slug ever needs to diverge from the internal id (unlikely here, but cheap to allow), this is where that seam would live.
// Order in this array is step order — index into STEPS is what "furthest valid step" will compare
import { personalInfoSchema } from "@/steps/personal-info/schema";
import { experienceSchema } from "@/steps/experience/schema";
import { skillsLinksSchema } from "@/steps/skills-links/schema";
import { availabilitySchema } from "@/steps/availability/schema";
import { resumeSchema, coverLetterSchema } from "@/steps/uploads/schema";
import type { FormData } from "@/types/form";
import type { FileState, ValidationResult } from "@/types/fields";

export const STEPS = [
  {
    id: "personal-info",
    path: "personal-info",
    label: "Personal Info",
    description: "Your name, email, and phone",
    pageSubHeader: "Please provide your personal details in the form below",
  },
  {
    id: "experience",
    path: "experience",
    label: "Experience",
    description: "Your current and past roles",
    pageSubHeader: "Please provide your experience details in the form below",
  },
  {
    id: "skills-links",
    path: "skills-links",
    label: "Skills & Links",
    description: "Skills, portfolio, and profiles",
    pageSubHeader: "Please provide your skills and links in the form below",
  },
  {
    id: "uploads",
    path: "uploads",
    label: "Uploads",
    description: "Resume and cover letter",
    pageSubHeader:
      "Please provide your resume and cover letter in the form below",
  },
  {
    id: "availability",
    path: "availability",
    label: "Availability",
    description: "Location and start date",
    pageSubHeader: "Please provide your availability details in the form below",
  },
  {
    id: "review",
    path: "review",
    label: "Review & Submit",
    description: "Check everything and submit",
    pageSubHeader: "Please review your application and submit when ready",
  },
] as const;

// Translation
// type StepId = "personal-info" | "experience" | "skills-links" | "uploads" | "availability" | "review"
export type StepId = (typeof STEPS)[number]["id"];

/**
 * Re-runs every step's own schema against current state, independent of
 * furthestUnlockedStep or any prior per-step validation. This is the
 * defense-in-depth check described in the requirements doc: per-step gates
 * can be bypassed (direct URL entry to /form/review, hand-edited
 * localStorage, stale sessions from before a schema change), so final
 * submit must trust nothing it hasn't re-checked itself.
 *
 * Shared by two callers: Review's final-submit handler (this file's
 * original purpose), and — once built — Phase 4's route guard, which needs
 * this exact same "derive first-invalid-step live" logic to decide whether
 * a direct navigation to /form/:step should be allowed or redirected.
 * Building it once here avoids two copies of step-schema orchestration
 * drifting out of sync with each other over time.
 */
export function validateAllSteps(
  data: FormData,
  files: FileState,
): ValidationResult {
  const stepChecks: [string, boolean][] = [
    [STEPS[0].path, personalInfoSchema.safeParse(data.personalInfo).success],
    [
      STEPS[1].path,
      experienceSchema.safeParse({
        ...data.experience,
        // Same store→form seam conversion ExperienceStep's defaultValues
        // already does — experienceSchema's yearsOfExperience starts as
        // z.string() (required for the live-typing form's coercion
        // chain), but the store holds it as a real number. Without this,
        // a perfectly valid number fails at the schema's first (string)
        // stage before coercion ever runs.
        yearsOfExperience: data.experience.yearsOfExperience?.toString() ?? "",
      }).success,
    ],
    [STEPS[2].path, skillsLinksSchema.safeParse(data.skillsLinks).success],
    [
      STEPS[3].path,
      resumeSchema.safeParse(files.resume).success &&
        coverLetterSchema.safeParse(files.coverLetter).success,
    ],
    [STEPS[4].path, availabilitySchema.safeParse(data.availability).success],
  ];

  const firstFailure = stepChecks.find(([, isValid]) => !isValid);

  return {
    isValid: !firstFailure, //if firstFailure is not true then isValid is true
    firstInvalidStepPath: firstFailure ? `/form/${firstFailure[0]}` : null,
  };
}
