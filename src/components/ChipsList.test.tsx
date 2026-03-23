import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ChipList } from "./ChipList";

describe("ChipList", () => {
  it("shows the empty message when there are no items", () => {
    render(<ChipList title="Skills" items={[]} />);
    expect(screen.getByText(/no skills added yet/i)).toBeInTheDocument();
  });

  it("renders every item", () => {
    render(<ChipList title="Skills" items={["React", "TypeScript"]} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  describe("remove button — the read-only-vs-interactive contract", () => {
    it("does NOT render a remove button when onRemove is omitted", () => {
      render(<ChipList title="Skills" items={["React"]} />);
      // No accessible button of any kind should exist at all — not just
      // an invisible one. This is the exact bug caught earlier: rendering
      // an empty, focusable, aria-labelled button with nothing wired to it.
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders a remove button and calls onRemove with the item when clicked", async () => {
      const onRemove = vi.fn();
      const user = userEvent.setup();
      render(<ChipList title="Skills" items={["React"]} onRemove={onRemove} />);

      const removeButton = screen.getByRole("button", {
        name: /remove react/i, // This is the aria-label attribute in the button, not the visible text
      });

      await user.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith("React");
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });
});
