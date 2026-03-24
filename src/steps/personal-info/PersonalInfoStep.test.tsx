import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { renderStep } from "@/test/renderStep";
import { useFormStore } from "@/store/formStore";

describe("PersonalInfoStep — fill and submit", () => {
  it("saves entered data to the store and navigates to Experience", async () => {
    const user = userEvent.setup();
    const router = renderStep("/form/personal-info");

    await user.type(screen.getByLabelText("First Name"), "Jane");
    await user.type(screen.getByLabelText("Last Name"), "Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone Number"), "+14155552671");
    await user.type(screen.getByLabelText("City"), "San Francisco");
    await user.selectOptions(screen.getByLabelText("Country"), "US");

    await user.click(screen.getByRole("button", { name: /next/i }));

    // Navigation actually happened — the real end-to-end signal, not just
    // "the store looks right." A bug in setFurthestUnlockedStep or the
    // navigate() call wouldn't be caught by checking the store alone.
    expect(router.state.location.pathname).toBe("/form/experience");

    const { personalInfo } = useFormStore.getState().data;

    // using toMatchObject instead of toEqual
    // toEqual would require every single field in personalInfo to match exactly,
    // including middleName (left blank, untouched by this test)
    // — toMatchObject only checks the fields we actually care about here
    expect(personalInfo).toMatchObject({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "+14155552671",
      city: "San Francisco",
      country: "US",
    });

    // furthestUnlockedStep actually advanced — the thing the route guard
    // depends on for every subsequent navigation in the app.
    expect(useFormStore.getState().furthestUnlockedStep).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("does not navigate when a required field is left blank", async () => {
    const user = userEvent.setup();
    const router = renderStep("/form/personal-info");

    // Deliberately leave everything blank and just try to submit —
    // confirms Next is a real gate, not just cosmetic.
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(router.state.location.pathname).toBe("/form/personal-info");
    expect(
      await screen.findByText(/first name is required/i),
    ).toBeInTheDocument();
  });
});
