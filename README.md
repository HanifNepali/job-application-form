# Job Application Form

A multi-step job application form built as a frontend-engineering-focused
portfolio project — React + TypeScript, strict per-step and final-submit
validation, persisted progress, and a fully client-side architecture with
no backend.

**Live app:** [https://job-application-form-zeta.vercel.app/](https://job-application-form-zeta.vercel.app/)

---

## ✨ Features

### Landing Page

A full-viewport intro page at `/` explaining the application process
before the user commits to starting. The call-to-action button is
context-aware: a fresh visitor sees "Ready to Start?", a returning user
with saved progress sees "Continue where you left off?" — and always
resumes exactly at their furthest completed step rather than restarting
from scratch.

### Multi-Step Form

Six steps, each with its own URL under `/form/*`:

| #   | Step                | Covers                                                                                                                                            |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Personal Info**   | Name, email, phone (with country selector synced to the phone's selected country), city, country                                                  |
| 2   | **Experience**      | Current role, years of experience, and a dynamic list of past roles (add/remove), with mutually-exclusive "currently working here" logic per role |
| 3   | **Skills & Links**  | A custom chips input for skills, plus portfolio/GitHub (optional) and LinkedIn (required) URLs                                                    |
| 4   | **Uploads**         | Resume (required) and cover letter (optional) — client-side type/size validated, session-only (not persisted, by design)                          |
| 5   | **Availability**    | Residency and relocation questions (with a conditional region selector), and an earliest-start-date picker                                        |
| 6   | **Review & Submit** | A full read-only summary of every step with per-section "Edit" links, a Terms & Conditions checkbox, and final submission                         |

### Validation Strategy

Validation happens at three distinct layers, each with a specific job:

- **Per-field, per-step** — each step is its own [React Hook Form](https://react-hook-form.com/) instance backed by a [Zod](https://zod.dev/) schema (`personalInfoSchema`, `experienceSchema`, `skillsLinksSchema`, `resumeSchema`/`coverLetterSchema`, `availabilitySchema`, `reviewSchema`), with onBlur-first / onChange-after-error timing to avoid flagging errors before a field has been touched.
- **Route-level reachability** — a guard in `FormLayout` prevents navigating ahead of progress genuinely made, based on `furthestUnlockedStep`, without re-validating every field on every navigation.
- **Final re-validation on submit** — `validateAllSteps` independently re-runs every step's schema against current state right before the real submit, redirecting to the first invalid step if anything has gone stale (a field broken after the fact, tampered `localStorage`, or Uploads' files being lost on refresh) — true defense-in-depth rather than trusting the per-step gates alone.

### Theming

Light/dark mode via a custom `ThemeContext`, respecting the OS's
`prefers-color-scheme` on first load, with a manual toggle that persists
the user's explicit choice thereafter.

### State Management

Two intentionally separate [Zustand](https://zustand-demo.pmnd.rs/) stores:

- `formStore` — all persisted form field data, wrapped in Zustand's `persist` middleware (backed by `localStorage`).
- `fileStore` — resume/cover letter `File` objects, deliberately **not** persisted (File objects aren't JSON-serializable, and session-only storage is a documented, intentional design choice, not a bug).

### Persistence

Form progress survives a refresh or closed tab via `localStorage` — a
returning visitor picks up exactly where they left off, both on the
landing page and via direct step navigation.

### No Backend, By Design

There's no server to submit to — final submission is a simulated
success (`alert()`), since the goal of this project is frontend depth,
not a real applicant-tracking pipeline. This is explicitly documented
scope, not an unfinished feature.

### Other notable features

- **Unsaved-changes protection** — a confirmation modal blocks in-app navigation away from a dirty, unsaved step (sidebar links, browser back/forward), plus the browser's native tab-close/refresh warning.
- **Full keyboard accessibility** — focus-trapped modals and mobile sidebar drawer, a skip-to-content link, and correct ARIA semantics throughout (see Accessibility section).
- **Reset / start over** — a confirmation-gated action on the Review step that clears all persisted form and file state.
- **Responsive, mobile-first layout** with a collapsible sidebar navigation drawer on smaller screens.
- **Custom typography** — Noto Serif for headings, Inter for body/UI text.

---

## 🛠 Tech Stack

| Category         | Choice                                                        |
| ---------------- | ------------------------------------------------------------- |
| Framework        | React + Vite                                                  |
| Language         | TypeScript                                                    |
| Forms            | React Hook Form                                               |
| Validation       | Zod (`@hookform/resolvers/zod`)                               |
| State Management | Zustand (persisted form state) + Context API (theme, sidebar) |
| Routing          | React Router (`createBrowserRouter`)                          |
| Styling          | Tailwind CSS                                                  |
| Testing          | Vitest + React Testing Library                                |
| Git Hooks        | Husky + lint-staged                                           |
| CI/CD            | Github Actions                                                |
| Deployment       | Vercel                                                        |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

```bash
npm run build   # production build
npm run lint    # ESLint
npm run test    # Vitest, watch mode
```

---

## 🧪 Testing

Built with **Vitest** + **React Testing Library**:

- **Unit tests** — colocated with the code they test (e.g. `schema.test.ts` next to each step's `schema.ts`), covering Zod schema logic (cross-field rules, boundary conditions) and presentational component contracts (e.g. `FieldError`'s `role="alert"`, `ChipList`'s conditional remove button).
- **Integration tests** — full step-level flows through real user interaction (`@testing-library/user-event`) and real routing (`createMemoryRouter`), covering the route guard, form fill-and-submit, the Experience step's exclusivity logic, and the unsaved-changes modal end to end.

```bash
npm run test -- --run   # run once (CI mode), rather than watch mode
```

---

## ✅ Pre-commit Hooks

**Husky** + **lint-staged** run ESLint (`--fix`) and Prettier against
staged files only, before every commit — fast, and scoped to what's
actually being committed rather than the whole project.

---

## ⚙️ CI/CD

- **CI** — lint, full test suite, and a production build check on every PR/push to `dev` and `main`.
- **AI PR Reviewer** — automatically reviews PRs and can be manually triggered via `workflow_dispatch` for an arbitrary PR number.
- **CD** — deployment is intentionally **not** handled by Vercel's own automatic Git integration. A custom `deploy.yml` workflow only fires once CI has completed successfully on `main`, guaranteeing a broken build can never reach production.

Full details, including the reasoning behind each design decision, are
in [`documentation/workflow`](./documentation/workflow).

---

## ♿ Accessibility

Keyboard navigation, focus management, ARIA semantics, and color
contrast were audited deliberately, not assumed. Full findings —
including issues identified and fixed during the audit, and known,
documented limitations — are in
[`documentation/audit`](./documentation/audit).

---

## 📚 Further Documentation

Additional design-decision write-ups (validation/routing architecture,
the file-upload implementation, the focus-trap hook, and more) are
available in the [`documentation`](./documentation) folder.

---

## 📦 Deployment

Hosted on **Vercel**. Deployment is **not** triggered by Vercel's
default Git integration (deliberately disabled via `vercel.json`) —
instead, a custom GitHub Actions workflow (`deploy.yml`) deploys only
after CI has passed on `main`, keeping build verification and
deployment strictly sequential rather than parallel and independent.
