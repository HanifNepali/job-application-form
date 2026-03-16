// src/steps/review/schema.ts
import { z } from "zod";

export const reviewSchema = z.object({
  termsAccepted: z.boolean().refine((v) => v === true, {
    // If val === true, validation passes (no error).
    message:
      "You must accept the Terms & Conditions to Submit your application",
  }),
});

export type ReviewData = z.infer<typeof reviewSchema>;
