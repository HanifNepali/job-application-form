// src/app/routeGuard.test.tsx
import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderStep } from "@/test/renderStep";
import { useFormStore } from "@/store/formStore";

describe("route guard", () => {
  it("redirects to the furthest unlocked step when jumping ahead", () => {
    // furthestUnlockedStep defaults to 0 (Personal Info only) after reset
    const router = renderStep("/form/availability");

    expect(router.state.location.pathname).toBe("/form/personal-info");
    expect(screen.getByText(/first name/i)).toBeInTheDocument();
  });

  it("allows navigation to a step within the unlocked range", () => {
    useFormStore.getState().setFurthestUnlockedStep(2); // Skills & Links unlocked
    const router = renderStep("/form/skills-links");

    expect(router.state.location.pathname).toBe("/form/skills-links");
  });

  it("does not block landing exactly on the furthest unlocked step", () => {
    useFormStore.getState().setFurthestUnlockedStep(1);
    const router = renderStep("/form/experience");

    expect(router.state.location.pathname).toBe("/form/experience");
  });
});
