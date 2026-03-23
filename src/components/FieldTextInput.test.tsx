import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FieldTextInput } from "./FieldTextInput";

describe("FieldTextInput", () => {
  it("associates the label with the input via htmlFor/id", () => {
    render(<FieldTextInput label="Email" name="email" onChange={() => {}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("sets aria-invalid and aria-describedby when there is an error", () => {
    render(
      <FieldTextInput
        label="Email"
        name="email"
        error="Required"
        onChange={() => {}}
      />,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
  });

  it("leaves aria-describedby unset (not present) when there is no error", () => {
    render(<FieldTextInput label="Email" name="email" onChange={() => {}} />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});
