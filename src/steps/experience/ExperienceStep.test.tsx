import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderStep } from "@/test/renderStep";
import { useFormStore } from "@/store/formStore";

describe("ExperienceStep — currently-working-here exclusivity", () => {
  it("only ever shows one role's End Date hidden at a time, and enforces exclusivity across rows", async () => {
    // unlock Experience before navigating to it,
    // else the route Guard in FormLayout will redirect to the furthestStepUnlocke i.e first step here
    useFormStore.getState().setFurthestUnlockedStep(1);

    const user = userEvent.setup();
    renderStep("/form/experience");

    // One blank role is seeded by default,
    // add a second so there's a real sibling relationship to test.
    await user.click(screen.getByRole("button", { name: /add role/i }));

    // Minimal fill for both rows — enough to isolate the exclusivity
    // behavior from unrelated required-field errors.
    const companyInputs = screen.getAllByLabelText("Company");
    const titleInputs = screen.getAllByLabelText("Title");
    const startDateInputs = screen.getAllByLabelText("Start Date");

    await user.type(companyInputs[0], "XYZ Corp");
    await user.type(titleInputs[0], "Engineer");
    await user.type(startDateInputs[0], "2020-01-01");

    await user.type(companyInputs[1], "Globex");
    await user.type(titleInputs[1], "Senior Engineer");
    await user.type(startDateInputs[1], "2022-01-01");

    // Two roles, neither current -> two visible End Date fields.
    expect(screen.getAllByLabelText("End Date")).toHaveLength(2);

    const checkboxes = screen.getAllByLabelText(/i currently work here/i);

    // Mark the SECOND role as current.
    await user.click(checkboxes[1]);

    // Only the first role's End Date should remain — the second's
    // unmounted, not just hidden/disabled.
    expect(screen.getAllByLabelText("End Date")).toHaveLength(1);
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[0]).not.toBeChecked();

    // Now mark the FIRST role as current instead.
    await user.click(checkboxes[0]);

    // Exclusivity: the second role's checkbox should have been forced
    // back off automatically, and its End Date should have reappeared —
    // proving this isn't just "check one, uncheck same one" but a real
    // cross-row effect.
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(screen.getAllByLabelText("End Date")).toHaveLength(1);
  });

  it("requires an End Date for a non-current role on submit", async () => {
    // unlock Experience before navigating to it,
    // else the route Guard in FormLayout will redirect to the furthestStepUnlocke i.e first step here
    useFormStore.getState().setFurthestUnlockedStep(1);

    const user = userEvent.setup();
    renderStep("/form/experience");

    await user.type(screen.getByLabelText("Current Role / Title"), "Engineer");
    await user.type(screen.getByLabelText("Total Years of Experience"), "5");
    await user.type(screen.getByLabelText("Company"), "XYZ Corp");
    await user.type(screen.getByLabelText("Title"), "Engineer");
    await user.type(screen.getByLabelText("Start Date"), "2020-01-01");
    // End Date deliberately left blank, checkbox deliberately left unchecked

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      await screen.findByText(/end date is required/i),
    ).toBeInTheDocument();
  });
});
