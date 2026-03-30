interface techItem {
  name: string;
  description: string;
}

export interface LandingContent {
  overview: {
    heading: string;
    paragraph: string;
  };
  detail: {
    paragraphTop: string;
    paragraphBottom: string;
  };
  techStack: {
    heading: string;
    items: techItem[];
  };
  decisions: {
    heading: string;
    items: { title: string; description: string }[];
  };
  accessibility: {
    heading: string;
    items: string[];
  };
}

export const landingContent: LandingContent = {
  overview: {
    heading: "Project Overview",
    paragraph:
      "A multi-step job application form built entirely client-side, with no backend — the focus is frontend engineering depth: form architecture, a layered validation strategy, accessibility, and state that survives a refresh without ever leaving the browser.",
  },
  detail: {
    paragraphTop:
      "This form walks through everything a hiring team typically need \
        your personal details, work experience, skills and links, a resume \
        upload, and your availability — broken into short, focused steps \
        rather than one long page. A progress indicator tracks where you \
        are throughout, and you're free to move between any step you've \
        already reached to review or change what you entered.",

    paragraphBottom:
      " Before anything is submitted, you'll see a complete summary of \
        every answer with the option to jump back and edit any section. \
        Your progress is saved automatically as you go, so if you leave \
        partway through, picking up again will return you right where you \
        left off.",
  },
  techStack: {
    heading: "Technologies Used",
    items: [
      {
        name: "React + TypeScript + Vite",
        description:
          "Strict typing throughout, including per-step Zod-inferred form types.",
      },
      {
        name: "React Hook Form",
        description:
          "Drives every step's form state, validation timing, and submission.",
      },
      {
        name: "Zod",
        description:
          "Schema validation for every field, with cross-field rules for conditional requirements.",
      },
      {
        name: "Zustand",
        description:
          "Two deliberately separate stores — persisted form data, and session-only uploaded files.",
      },
      {
        name: "Tailwind CSS",
        description:
          "Utility-first styling, themed with CSS variables for light/dark.",
      },
      {
        name: "Motion",
        description:
          "Entrance animations and modal transitions, respecting reduced-motion preferences throughout.",
      },
      {
        name: "Vitest + React Testing Library",
        description:
          "Unit tests for schema logic, integration tests for full step-level flows.",
      },
    ],
  },
  decisions: {
    heading: "Key Implementation Decisions",
    items: [
      {
        title: "Three-layer validation strategy",
        description:
          "Per-field validation gates each step's own submit. A route guard separately governs reachability, based on progress alone. A final re-validation pass re-checks every step right before submit.",
      },
      {
        title: "Persisted vs. session-only state, kept deliberately separate",
        description:
          "Form field data persists to localStorage but Uploaded files are session-only.",
      },
      {
        title: "Theme respects the OS, until the user overrides it",
        description:
          "On first visit, theme follows the system's light/dark preference. The moment it's toggled manually, that choice is persisted and takes over permanently.",
      },
      {
        title:
          "Unsaved changes are protected, separately from navigation guarding",
        description:
          "Leaving a step with uncommitted edits via the sidebar or browser back, prompts a confirmation, entirely independent of the logic that governs which steps are reachable at all.",
      },
    ],
  },
  accessibility: {
    heading: "Accessibility Considerations",
    items: [
      "A skip-to-content link, and focus-trapped modals and mobile navigation drawer.",
      'Correct ARIA semantics throughout e.g role="alert" for field errors, role="alertdialog" for confirmations, aria-current on the active step.',
      "Every color pairing checked against real WCAG contrast ratios, not eyeballed — token values were corrected after the audit found real failures in both themes.",
      "Every animation respects prefers-reduced-motion",
    ],
  },
};
