import { describe, it, expect } from "vitest";
import { validateAllSteps } from "./steps";
import { initialFormData } from "@/types/form";
import type { FormData } from "@/types/form";

function makeFile(sizeInBytes = 1024, type = "application/pdf"): File {
  return new File([new Uint8Array(sizeInBytes)], "resume.pdf", { type });
}

const validData: FormData = {
  ...initialFormData,
  personalInfo: {
    firstName: "Jane",
    middleName: "",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "+14155552671",
    city: "San Francisco",
    country: "US",
  },
  experience: {
    currentRole: "Engineer",
    yearsOfExperience: 5,
    pastRoles: [
      {
        id: "1",
        company: "Acme",
        title: "Engineer",
        startDate: "2020-01-01",
        endDate: "2022-01-01",
        isCurrentRole: false,
      },
    ],
  },
  skillsLinks: {
    skills: ["React"],
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "https://linkedin.com/in/jane",
  },
  availability: {
    residesInJobLocation: true,
    willingToRelocate: false,
    relocationRegions: [],
    earliestStartDate: new Date().toISOString().slice(0, 10),
  },
};

const validFiles = { resume: makeFile(), coverLetter: null };

describe("validateAllSteps", () => {
  it("returns isValid: true and no invalid path when every step is valid", () => {
    const result = validateAllSteps(validData, validFiles);
    expect(result.isValid).toBe(true);
    expect(result.firstInvalidStepPath).toBeNull();
  });

  it("catches a genuinely invalid yearsOfExperience value", () => {
    const data: FormData = {
      ...validData,
      experience: { ...validData.experience, yearsOfExperience: -1 },
    };
    const result = validateAllSteps(data, validFiles);
    expect(result.isValid).toBe(false);
    expect(result.firstInvalidStepPath).toBe("/form/experience");
  });

  it("returns the FIRST invalid step in page order when multiple steps are invalid", () => {
    const data: FormData = {
      ...validData,
      personalInfo: { ...validData.personalInfo, firstName: "" }, // step 0, invalid
      skillsLinks: { ...validData.skillsLinks, linkedinUrl: "" }, // step 2, also invalid
      experience: { ...validData.experience, currentRole: "" }, // step 1, also invalid
    };
    const result = validateAllSteps(data, validFiles);
    expect(result.firstInvalidStepPath).toBe("/form/personal-info");
  });

  describe("Uploads — the two-schemas-combined-into-one-step case", () => {
    it("fails when resume is missing, even if everything else is valid", () => {
      const result = validateAllSteps(validData, {
        resume: null,
        coverLetter: null,
      });
      expect(result.isValid).toBe(false);
      expect(result.firstInvalidStepPath).toBe("/form/uploads");
    });

    it("passes with resume present and coverLetter null (optional, absent)", () => {
      const result = validateAllSteps(validData, {
        resume: makeFile(),
        coverLetter: null,
      });
      expect(result.isValid).toBe(true);
    });

    it("fails when coverLetter is present but invalid, even with a valid resume", () => {
      const result = validateAllSteps(validData, {
        resume: makeFile(),
        coverLetter: makeFile(1024, "image/png"), // wrong file type
      });
      expect(result.isValid).toBe(false);
      expect(result.firstInvalidStepPath).toBe("/form/uploads");
    });
  });

  it("does NOT validate the Review step's own data (termsAccepted) — that's a separate schema/mechanism", () => {
    // validData has no `review` field touched at all — if validateAllSteps
    // tried to check Review, this would need termsAccepted seeded true to
    // pass; the fact that it passes untouched confirms Review is excluded.
    const result = validateAllSteps(validData, validFiles);
    expect(result.isValid).toBe(true);
  });
});
