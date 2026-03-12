import { z } from "zod";

const pastRoleSchema = z
  .object({
    id: z.string(),
    company: z.string().trim().min(1, "Company is required"),
    title: z.string().trim().min(1, "Title is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string(), // "" is valid when isCurrentRole is true; enforced below
    isCurrentRole: z.boolean(),
  })
  .superRefine((role, ctx) => {
    if (!role.isCurrentRole && role.endDate.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date is required",
      });
    }
  });

export const experienceSchema = z.object({
  currentRole: z.string().trim().min(1, "Current role is required"), // was: currentTitle

  yearsOfExperience: z
    .string()
    .min(1, "Total years of experience is required")
    .transform((val, ctx) => {
      const parsed = Number(val);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({ code: "custom", message: "Enter a number" });
        return z.NEVER;
      }
      return parsed;
    })
    .pipe(
      z
        .number()
        .min(0, "Must be 0 or more")
        .max(60, "Enter a realistic number of years"),
    ),

  pastRoles: z.array(pastRoleSchema).superRefine((roles, ctx) => {
    const currentIndexes = roles
      .map((r, i) => (r.isCurrentRole ? i : -1))
      .filter((i) => i !== -1);

    if (currentIndexes.length > 1) {
      currentIndexes.forEach((i) => {
        ctx.addIssue({
          code: "custom",
          path: [i, "isCurrentRole"],
          message: "Only one role can be marked as currently working",
        });
      });
    }
  }),
});

// experienceSchema isn't a pure "shape validator" anymore — because of yearsOfExperience's .
// transform().pipe() chain, the schema actually changes the shape of the data as
// it validates: a string goes in, a number comes out.
// Once a Zod schema does that, "the type of data this schema works with" stops being a single answer
// — there's genuinely a before and an after, and Zod gives you two separate inference helpers
// because those are two separate types:

//z.input<typeof experienceSchema> — what you're allowed to hand the schema before validation runs. For yearsOfExperience specifically, that's string (it starts as z.string() at the top of the chain). This is ExperienceFormValues.
//z.output<typeof experienceSchema> — what the schema produces after successfully validating and transforming. For yearsOfExperience, that's number (the far end of .pipe(z.number()...)). This is ExperienceData.

export type ExperienceFormValues = z.input<typeof experienceSchema>;
export type ExperienceData = z.output<typeof experienceSchema>;

// Experience.yearsOfExperience is number | null → converted to string for defaultValues
// since FieldTextInput renders a native <input> (DOM values are always strings)
//  → Zod's .transform().pipe() coerces that string back to number on validation
//  → onSubmit's parameter is typed ExperienceData (Zod's output type) specifically
// so values.yearsOfExperience is a real number there,
// matching what updateExperience expects to write back into the store.
