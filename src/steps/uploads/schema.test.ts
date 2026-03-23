import { describe, it, expect } from "vitest";
import { resumeSchema, coverLetterSchema } from "./schema";

function makeFile(sizeInBytes: number, type: string, name = "file.pdf"): File {
  return new File([new Uint8Array(sizeInBytes)], name, { type });
}

const validPdf = makeFile(1024, "application/pdf");
const oversizedPdf = makeFile(3 * 1024 * 1024, "application/pdf"); // over the 2MB limit
const wrongFileType = makeFile(1024, "image/png");

describe("filestore validation", () => {
  describe("resumeSchema (required)", () => {
    it("rejects null", () => {
      expect(resumeSchema.safeParse(null).success).toBe(false);
    });

    it("rejects the wrong file type", () => {
      expect(resumeSchema.safeParse(wrongFileType).success).toBe(false);
    });

    it("rejects an oversized file", () => {
      expect(resumeSchema.safeParse(oversizedPdf).success).toBe(false);
    });

    it("accepts a valid PDF within the size limit", () => {
      expect(resumeSchema.safeParse(validPdf).success).toBe(true);
    });
  });

  describe("coverLetterSchema (optional)", () => {
    it("accepts null, unlike resumeSchema", () => {
      expect(coverLetterSchema.safeParse(null).success).toBe(true);
    });

    it("still rejects a present-but-invalid file (wrong type)", () => {
      expect(coverLetterSchema.safeParse(wrongFileType).success).toBe(false);
    });

    it("still rejects a present-but-oversized file", () => {
      expect(coverLetterSchema.safeParse(oversizedPdf).success).toBe(false);
    });

    it("accepts a valid PDF when one is provided", () => {
      expect(coverLetterSchema.safeParse(validPdf).success).toBe(true);
    });
  });
});
