import { createBrowserRouter, Navigate } from "react-router-dom";
import { FormLayout } from "@/app/FormLayout";
import { PersonalInfoStep } from "@/steps/personal-info/PersonalInfoStep";
import { ExperienceStep } from "@/steps/experience/ExperienceStep";
import { SkillsLinksStep } from "@/steps/skills-links/SkillsLinksStep";
import { UploadsStep } from "@/steps/uploads/UploadsStep";
import { AvailabilityStep } from "@/steps/availability/AvailabilityStep";
import { ReviewStep } from "@/steps/review/ReviewStep";
import { STEPS } from "@/lib/steps";

// PHASE 1 SCOPE NOTE: routes are wide open right now — no guard.
// The route guard (checking furthestValidStep, redirecting on direct URL
// entry / refresh / a previously-valid step going stale) is Phase 4 scope.
// It needs per-step validation (Phase 3) to exist before there's anything
// to guard against, so it can't land here yet.

export const router = createBrowserRouter([
  {
    // Bare "/" isn't a real step — always send the user to the first one for now.
    path: "/",
    element: <Navigate to={`/form/${STEPS[0].path}`} replace />,
  },
  {
    path: "/form",
    element: <FormLayout />,
    children: [
      // "/form" with no step slug — same idea, land on step one for now.
      { index: true, element: <Navigate to={STEPS[0].path} replace /> },
      { path: "personal-info", element: <PersonalInfoStep /> },
      { path: "experience", element: <ExperienceStep /> },
      { path: "skills-links", element: <SkillsLinksStep /> },
      { path: "uploads", element: <UploadsStep /> },
      { path: "availability", element: <AvailabilityStep /> },
      { path: "review", element: <ReviewStep /> },
    ],
  },
  {
    // Catch-all for unknown paths — no 404 page in scope, just recover
    // to the start of the form for now.
    path: "*",
    element: <Navigate to={`/form/${STEPS[0].path}`} replace />,
  },
]);
