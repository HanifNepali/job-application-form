import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FieldError } from "./FieldError";

describe("FieldError", () => {
  it("renders nothing when there is no message", () => {
    const { container } = render(<FieldError id="test-error" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message with role=alert when present", () => {
    render(<FieldError id="test-error" message="This field is required" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This field is required");
    expect(alert).toHaveAttribute("id", "test-error");
  });
});
