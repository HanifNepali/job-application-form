import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),

  // Optional field: empty string is the "untouched" state from an
  // uncontrolled text input, so we treat "" the same as not provided.
  // z.literal("") union keeps the type as `string`, not `string | undefined`,
  // which matches how RHF/register naturally populates text inputs.
  middleName: z.string().trim().optional().or(z.literal("")),

  lastName: z.string().trim().min(1, "Last name is required"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  // react-phone-number-input stores the value as a single E.164 string
  // (e.g. "+15551234567"), not separate country-code/number fields, so a
  // single string field is enough here. isValidPhoneNumber does the real
  // validation (correct length/format for whichever country is selected);
  // a plain z.string().min() would accept garbage as long as it's non-empty.
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, "Enter a valid phone number"), // isValidPhoneNumber should return true to pass validation

  city: z.string().trim().min(1, "City is required"),

  // Stored as the ISO 3166-1 alpha-2 code (e.g. "US"), same format
  // getCountries() returns — the <select>'s <option value> will be the
  // code, and we resolve it to a display name only at render time via the
  // locale file. Keeping the stored value as a code (not a display name)
  // means it stays locale-independent if we ever add i18n later.
  country: z.string().min(1, "Country is required"),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
