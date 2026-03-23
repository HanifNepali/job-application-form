import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("defaults to type=button, not type=submit", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("allows an explicit type=submit override", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("forwards a ref to the underlying button element", () => {
    // Creates a temporary local variable to store the DOM element reference once React hooks it up.
    let ref: HTMLButtonElement | null = null;
    // Instead of passing a standard useRef() object, the test passes a callback ref.
    // When the component mounts, React automatically calls this function
    // and passes the underlying DOM element (el) as the argument.
    // The test grabs that element and assigns it to the local ref variable.
    render(
      <Button
        ref={(el) => {
          ref = el;
        }}
      >
        Click me
      </Button>,
    );
    // Is the object inside ref built from the blueprint of a native HTML <button> element
    expect(ref).toBeInstanceOf(HTMLButtonElement);
  });
});
