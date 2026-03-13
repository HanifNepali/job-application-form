import en from "react-phone-number-input/locale/en.json";
import { getCountries } from "react-phone-number-input";

import type { CountryOption } from "@/types/fields";

export const countryOptions: CountryOption[] = getCountries()
  .map((code) => ({
    value: code,
    label: en[code] ?? code,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
