import { describe, it, expect } from "vitest";
import { skillsLinksSchema } from "./schema";

const validData = {
  skills: ["React", "TypeScript"],
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "https://linkedin.com/in/someone",
};

describe("skillsLinksSchema", () => {
  it("accepts fully valid data", () => {
    expect(skillsLinksSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects an empty skills array", () => {
    expect(
      skillsLinksSchema.safeParse({ ...validData, skills: [] }).success,
    ).toBe(false);
  });

  describe("optional URLs (portfolio, github)", () => {
    it.each(["portfolioUrl", "githubUrl"] as const)(
      "accepts an empty string for %s",
      (field) => {
        expect(
          skillsLinksSchema.safeParse({ ...validData, [field]: "" }).success,
        ).toBe(true);
      },
    );

    it.each(["portfolioUrl", "githubUrl"] as const)(
      "rejects a non-empty, non-URL string for %s",
      (field) => {
        expect(
          skillsLinksSchema.safeParse({ ...validData, [field]: "not a url" })
            .success,
        ).toBe(false);
      },
    );

    it.each(["portfolioUrl", "githubUrl"] as const)(
      "accepts a real URL for %s",
      (field) => {
        expect(
          skillsLinksSchema.safeParse({
            ...validData,
            [field]: "https://example.com",
          }).success,
        ).toBe(true);
      },
    );
  });

  describe("linkedinUrl — required, unlike the other two", () => {
    it("rejects an empty string", () => {
      expect(
        skillsLinksSchema.safeParse({ ...validData, linkedinUrl: "" }).success,
      ).toBe(false);
    });

    it("rejects an invalid URL", () => {
      expect(
        skillsLinksSchema.safeParse({ ...validData, linkedinUrl: "not a url" })
          .success,
      ).toBe(false);
    });
  });
});
