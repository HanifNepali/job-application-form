import { describe, it, expect } from "vitest";
import { availabilitySchema } from "./schema";

function todayDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const validData = {
  residesInJobLocation: true,
  willingToRelocate: false,
  relocationRegions: [],
  earliestStartDate: todayDateString(),
};

describe("availabilitySchema", () => {
  it("accepts fully valid data", () => {
    expect(availabilitySchema.safeParse(validData).success).toBe(true);
  });

  describe("required Yes/No fields", () => {
    it.each(["residesInJobLocation", "willingToRelocate"] as const)(
      "rejects %s when null (unanswered)",
      (field) => {
        const result = availabilitySchema.safeParse({
          ...validData,
          [field]: null, // residesInJobLocation: null or willingToRelocate: null
        });
        expect(result.success).toBe(false);
      },
    );

    it.each(["residesInJobLocation", "willingToRelocate"] as const)(
      "accepts %s as either true or false",
      (field) => {
        expect(
          availabilitySchema.safeParse({ ...validData, [field]: false })
            .success,
        ).toBe(true);
        expect(
          availabilitySchema.safeParse({
            ...validData,
            [field]: false,
            relocationRegions: ["usa"], // needed in the case of willingToRelocate: true, but harmless here
          }).success,
        ).toBe(true);
      },
    );
  });

  describe("relocationRegions — conditionally required", () => {
    it("rejects an empty array when willingToRelocate is true", () => {
      const result = availabilitySchema.safeParse({
        ...validData,
        willingToRelocate: true,
        relocationRegions: [],
      });
      expect(result.success).toBe(false);
    });

    it("accepts an empty array when willingToRelocate is false", () => {
      const result = availabilitySchema.safeParse({
        ...validData,
        willingToRelocate: false,
        relocationRegions: [],
      });
      expect(result.success).toBe(true);
    });

    it("accepts a non-empty array when willingToRelocate is true", () => {
      const result = availabilitySchema.safeParse({
        ...validData,
        willingToRelocate: true,
        relocationRegions: ["usa"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("earliestStartDate — today-or-later boundary", () => {
    it("rejects yesterday", () => {
      const result = availabilitySchema.safeParse({
        ...validData,
        earliestStartDate: todayDateString(-1),
      });
      expect(result.success).toBe(false);
    });

    it("accepts today", () => {
      const result = availabilitySchema.safeParse({
        ...validData,
        earliestStartDate: todayDateString(0),
      });
      expect(result.success).toBe(true);
    });

    it("accepts tomorrow", () => {
      const result = availabilitySchema.safeParse({
        ...validData,
        earliestStartDate: todayDateString(1),
      });
      expect(result.success).toBe(true);
    });
  });
});
