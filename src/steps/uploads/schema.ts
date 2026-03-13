import { z } from "zod";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const fileConstraints = (file: File) => {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Only PDF, DOC, or DOCX files are allowed";

  if (file.size > MAX_SIZE) return "File must be under 2MB";

  return null;
};

export const resumeSchema = z
  .instanceof(File, { message: "Resume is required" })
  .superRefine((file, ctx) => {
    const issue = fileConstraints(file);
    if (issue) ctx.addIssue({ code: "custom", message: issue });
  });

export const coverLetterSchema = z
  .instanceof(File)
  .superRefine((file, ctx) => {
    const issue = fileConstraints(file);
    if (issue) ctx.addIssue({ code: "custom", message: issue });
  })
  .nullable(); //allows the value to be null i.e optional field

export const uploadsSchema = z.object({
  resume: resumeSchema,
  coverLetter: coverLetterSchema,
});

export type UploadsData = z.infer<typeof uploadsSchema>;
