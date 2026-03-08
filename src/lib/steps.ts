// as const locks the array down to literal types,
// so StepId becomes the exact union 'personal-info' | 'experience' | ... instead of just string.
// That's what lets TypeScript catch typos later (e.g. in the store or route guard) if someone writes 'personal-infoo'.

// path is separate from id even though they're equal today
// if a URL slug ever needs to diverge from the internal id (unlikely here, but cheap to allow), this is where that seam would live.
// Order in this array is step order — index into STEPS is what "furthest valid step" will compare

export const STEPS = [
  { id: "personal-info", path: "personal-info", label: "Personal Info" },
  { id: "experience", path: "experience", label: "Experience" },
  { id: "skills-links", path: "skills-links", label: "Skills & Links" },
  { id: "uploads", path: "uploads", label: "Uploads" },
  { id: "availability", path: "availability", label: "Availability" },
  { id: "review", path: "review", label: "Review & Submit" },
] as const;

// Translation
// type StepId = "personal-info" | "experience" | "skills-links" | "uploads" | "availability" | "review"
export type StepId = (typeof STEPS)[number]["id"];
