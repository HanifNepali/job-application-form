// Aggregate shape of all persisted form data, stitched together from every
// step. This is the *persisted* slice's shape only — uploaded files are
// deliberately NOT part of this type (File objects aren't JSON-serializable
// and shouldn't go in localStorage regardless).
// Files live in a separate in-memory-only store — see fileStore.ts.

export interface PastRole {
  id: string; // stable key for useFieldArray, not shown to the user
  company: string;
  title: string;
  startDate: string; // ISO date string (yyyy-mm-dd), matches <input type="date">
  endDate: string; // ignored/blank when isCurrent is true
  isCurrent: boolean;
}

export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string; // E.164-ish string from react-phone-number-input
  city: string;
  country: string; // country code, driven by a select/combobox — not free text
}

export interface Experience {
  currentRole: string;
  yearsOfExperience: number | null;
  pastRoles: PastRole[];
}

export interface SkillsLinks {
  skills: string[];
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface Availability {
  // Required Yes/No. null is the pre-answer state only — Zod's schema
  residesInJobLocation: boolean | null;
  // Required Yes/No, same null-as-unanswered pattern as above.
  willingToRelocate: boolean | null;
  // Optional in general, but conditionally required: Zod enforces at
  // least one region here only when willingToRelocate === true.
  relocationRegions: string[];
  earliestStartDate: string; // ISO date string
}

export interface Review {
  termsAccepted: boolean;
}

export interface FormData {
  personalInfo: PersonalInfo;
  experience: Experience;
  skillsLinks: SkillsLinks;
  availability: Availability;
  review: Review;
  // Uploads step has no persisted fields of its own — resume/cover letter
  // are file references, which live entirely in the separate file store.
}

// Single source of truth for "what does a blank form look like" — used to
// initialize the store and by the future "reset / start over" action, so
// there's exactly one place defining empty-state instead of it being
// re-derived (and risking drift) wherever the store is initialized.
export const initialFormData: FormData = {
  personalInfo: {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  },
  experience: {
    currentRole: "",
    yearsOfExperience: null,
    pastRoles: [],
  },
  skillsLinks: {
    skills: [],
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
  },
  availability: {
    residesInJobLocation: null,
    willingToRelocate: null,
    relocationRegions: [],
    earliestStartDate: "",
  },
  review: {
    termsAccepted: false,
  },
};
