import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderStep } from "@/test/renderStep";
import { useFormStore } from "@/store/formStore";

describe("Unsaved changes modal", () => {
  it("blocks sidebar navigation when the current step is dirty, and shows the modal", async () => {
    // unlock Experience so the sidebar has somewhere to navigate to
    useFormStore.getState().setFurthestUnlockedStep(1);
    const user = userEvent.setup();
    renderStep("/form/personal-info");

    // Dirty the form — RHF's isDirty only flips once a field genuinely
    // differs from defaultValues, so typing (not just focusing) is required.
    await user.type(screen.getByLabelText("First Name"), "Jane");
    await user.click(screen.getByRole("link", { name: /experience/i }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    // Dropping "i" for case insensitive match else it will result in an array.
    // Body copy of the modal also has "You have unsaved changes..."
    expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument();

    // Navigation must have actually been blocked,
    // not just the modal shown alongside a navigation that happened anyway.
    expect(screen.getByLabelText("First Name")).toHaveValue("Jane");
  });

  it('"Stay on this page" cancels the navigation and closes the modal', async () => {
    useFormStore.getState().setFurthestUnlockedStep(1);
    const user = userEvent.setup();
    const router = renderStep("/form/personal-info");

    await user.type(screen.getByLabelText("First Name"), "Jane");
    await user.click(screen.getByRole("link", { name: /experience/i }));
    await screen.findByRole("alertdialog");

    await user.click(
      screen.getByRole("button", { name: /stay on this page/i }),
    );

    // AnimatePresence keeps the modal mounted through its exit transition —
    // it no longer disappears synchronously on click, so this needs to poll
    // for removal rather than assert it instantly.
    await waitForElementToBeRemoved(() => screen.queryByRole("alertdialog"));

    expect(router.state.location.pathname).toBe("/form/personal-info");
    expect(screen.getByLabelText("First Name")).toHaveValue("Jane"); // typed data survives the cancel
  });

  it('"Leave without saving" proceeds with the navigation and discards the unsaved data', async () => {
    useFormStore.getState().setFurthestUnlockedStep(1);
    useFormStore.getState().updatePersonalInfo({ firstName: "Jenny" });
    const user = userEvent.setup();
    const router = renderStep("/form/personal-info");

    // Clear the pre-populated "Jenny" text else It will Result in JennyJane
    await user.clear(screen.getByLabelText("First Name"));

    await user.type(screen.getByLabelText("First Name"), "Jane");
    await user.click(screen.getByRole("link", { name: /experience/i }));
    await screen.findByRole("alertdialog");

    await user.click(
      screen.getByRole("button", { name: /leave without saving/i }),
    );

    expect(router.state.location.pathname).toBe("/form/experience");

    // The typed-but-never-submitted "Jane" must NOT have reached the
    // persisted store — this is the actual point of the whole feature.
    expect(useFormStore.getState().data.personalInfo.firstName).toBe("Jenny");
  });

  it("does not block navigation when the step is clean (untouched)", async () => {
    useFormStore.getState().setFurthestUnlockedStep(1);
    const user = userEvent.setup();
    const router = renderStep("/form/personal-info");

    // No typing at all — nothing dirty.
    await user.click(screen.getByRole("link", { name: /experience/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/form/experience");
  });
});
