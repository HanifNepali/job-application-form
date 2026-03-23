import { describe, it, expect } from "vitest";
import { personalInfoSchema } from "./schema";

const validData = {
  firstName: "Jane",
  middleName: "",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "+14155552671", // valid US number, per react-phone-number-input's own validation
  city: "San Francisco",
  country: "US",
};

describe("personalInfoSchema", () => {
  it("accepts fully valid data", () => {
    expect(personalInfoSchema.safeParse(validData).success).toBe(true);
  });

  describe("required fields", () => {
    it.each([
      "firstName",
      "lastName",
      "email",
      "phone",
      "city",
      "country",
    ] as const)("rejects an empty %s", (field) => {
      const result = personalInfoSchema.safeParse({
        ...validData,
        [field]: "",
      });
      expect(result.success).toBe(false);
    });
  });

  it("accepts an empty middleName (genuinely optional)", () => {
    expect(
      personalInfoSchema.safeParse({ ...validData, middleName: "" }).success,
    ).toBe(true);
  });

  describe("email format", () => {
    it("rejects a non-email string", () => {
      expect(
        personalInfoSchema.safeParse({ ...validData, email: "not-an-email" })
          .success,
      ).toBe(false);
    });
  });

  describe("phone validation", () => {
    it("rejects a string that isn't a valid phone number", () => {
      const result = personalInfoSchema.safeParse({
        ...validData,
        phone: "12345",
      });
      expect(result.success).toBe(false);
    });

    it("accepts a genuinely valid E.164 number", () => {
      const result = personalInfoSchema.safeParse({
        ...validData,
        phone: "+14155552671",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("trimming", () => {
    it("trims leading/trailing whitespace on firstName", () => {
      const result = personalInfoSchema.safeParse({
        ...validData,
        firstName: "  Jane  ",
      });
      if (result.success) {
        expect(result.data.firstName).toBe("Jane");
      } else {
        throw new Error("expected success");
      }
    });
  });
});
