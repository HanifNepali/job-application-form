import { z } from "zod";

const optionalUrl = z
  .url({ message: "Enter a valid URL" }) // Top-level URL validation
  .optional()
  .or(z.literal(""));

export const skillsLinksSchema = z.object({
  skills: z.array(z.string()).min(1, "Add at least one skill"),

  portfolioUrl: optionalUrl,
  githubUrl: optionalUrl,

  linkedinUrl: z
    .string()
    .trim()
    .min(1, "LinkedIn URL is required")
    .pipe(z.url({ message: "Enter a valid URL" })),
});

export type SkillsLinksData = z.infer<typeof skillsLinksSchema>;
