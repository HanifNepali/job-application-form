import { describe, it, expect } from "vitest";
import { experienceSchema } from "./schema";

const baseRole = {
  id: "1",
  company: "XYZ Corp",
  title: "Engineer",
  startDate: "2020-01-01",
  endDate: "2022-01-01",
  isCurrentRole: false,
};

const validData = {
  currentRole: "Senior Engineer",
  yearsOfExperience: "5",
  pastRoles: [baseRole],
};

describe("experienceSchema", () => {
  it("accepts fully valid data", () => {
    expect(experienceSchema.safeParse(validData).success).toBe(true);
  });

  describe("yearsOfExperience coercion", () => {
    it.each([
      ["", false],
      ["not a number", false],
      ["-1", false],
      ["61", false],
      ["0", true],
      ["60", true],
    ])("value: %s -> valid: %s", (value, expected) => {
      const result = experienceSchema.safeParse({
        ...validData,
        yearsOfExperience: value,
      });
      expect(result.success).toBe(expected);
    });

    it("produces a real number in the parsed output, not a string", () => {
      const result = experienceSchema.safeParse({
        ...validData,
        yearsOfExperience: "10",
      });
      if (result.success) {
        expect(result.data.yearsOfExperience).toBe(10);
        expect(typeof result.data.yearsOfExperience).toBe("number");
      } else {
        throw new Error("expected success");
      }
    });
  });

  describe("pastRoles — 'currently-working-here' exclusivity", () => {
    it("rejects more than one role marked isCurrentRole", () => {
      const result = experienceSchema.safeParse({
        ...validData,
        pastRoles: [
          { ...baseRole, id: "1", isCurrentRole: true, endDate: "" },
          { ...baseRole, id: "2", isCurrentRole: true, endDate: "" },
        ],
      });
      expect(result.success).toBe(false);
    });

    it("allows exactly one role marked isCurrentRole", () => {
      const result = experienceSchema.safeParse({
        ...validData,
        pastRoles: [
          { ...baseRole, id: "1", isCurrentRole: true, endDate: "" },
          { ...baseRole, id: "2", isCurrentRole: false },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("per-role endDate requirement", () => {
    it("rejects a non-current role with a blank endDate", () => {
      const result = experienceSchema.safeParse({
        ...validData,
        pastRoles: [{ ...baseRole, isCurrentRole: false, endDate: "" }],
      });
      expect(result.success).toBe(false);
    });

    it("accepts a current role with a blank endDate", () => {
      const result = experienceSchema.safeParse({
        ...validData,
        pastRoles: [{ ...baseRole, isCurrentRole: true, endDate: "" }],
      });
      expect(result.success).toBe(true);
    });
  });
});
