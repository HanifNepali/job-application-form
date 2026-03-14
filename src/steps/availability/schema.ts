import { z } from "zod";

// Computed from *local* date parts, not `new Date().toISOString()` — the
// ISO string is UTC-based, which can silently disagree with the user's
// actual local "today" near midnight (e.g. someone in a UTC+5:45 timezone
// could have their locally-correct "today" rejected as "in the past," or
// vice versa). <input type="date"> itself has no timezone concept — its
// value is just local date parts — so validation needs to match that.
function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Same "boolean | null in, boolean out" shape as Experience's
// yearsOfExperience — null represents "unanswered," per the Phase 1
// convention already established in types/form.ts, and refine's type
// predicate narrows the *output* type to plain boolean once null is
// excluded, giving us the same z.input/z.output split as before.
const requiredYesNo = z
  .boolean()
  .nullable()
  .refine((v): v is boolean => v !== null, {
    message: "Please select an option",
  });

export const availabilitySchema = z
  .object({
    residesInJobLocation: requiredYesNo,
    willingToRelocate: requiredYesNo,
    relocationRegions: z.array(z.string()), // conditionally required — see superRefine below
    earliestStartDate: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (val) => val >= todayDateString(),
        "Start date must be today or later",
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.willingToRelocate === true &&
      data.relocationRegions.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["relocationRegions"],
        message: "Select at least one region",
      });
    }
  });

export type AvailabilityFormValues = z.input<typeof availabilitySchema>;
export type AvailabilityData = z.output<typeof availabilitySchema>;
