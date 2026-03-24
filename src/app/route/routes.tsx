// src/app/routes.tsx
import { Navigate } from "react-router-dom";
import { FormLayout } from "../FormLayout";
import { PersonalInfoStep } from "@/steps/personal-info/PersonalInfoStep";
// ...other step imports...
import { STEPS } from "@/lib/steps";
import { ExperienceStep } from "@/steps/experience/ExperienceStep";
import { SkillsLinksStep } from "@/steps/skills-links/SkillsLinksStep";
import { UploadsStep } from "@/steps/uploads/UploadsStep";
import { AvailabilityStep } from "@/steps/availability/AvailabilityStep";
import { ReviewStep } from "@/steps/review/ReviewStep";

export const routes = [
  { path: "/", element: <Navigate to={`/form/${STEPS[0].path}`} replace /> },
  {
    path: "/form",
    element: <FormLayout />,
    children: [
      { index: true, element: <Navigate to={STEPS[0].path} replace /> },
      { path: "personal-info", element: <PersonalInfoStep /> },
      { path: "experience", element: <ExperienceStep /> },
      { path: "skills-links", element: <SkillsLinksStep /> },
      { path: "uploads", element: <UploadsStep /> },
      { path: "availability", element: <AvailabilityStep /> },
      { path: "review", element: <ReviewStep /> },
    ],
  },
  { path: "*", element: <Navigate to={`/form/${STEPS[0].path}`} replace /> },
];
