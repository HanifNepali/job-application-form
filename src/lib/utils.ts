import en from "react-phone-number-input/locale/en.json";
import { getCountries } from "react-phone-number-input";

import type { CountryOption } from "@/types/fields";
import { RELOCATION_REGIONS } from "./constants";

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

export const isValueEmpty = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === "";

export function countryLabel(code: string): string {
  return countryOptions.find((c) => c.value === code)?.label ?? code;
}

export function regionLabels(values: string[]): string {
  if (values.length === 0) return "";
  return values
    .map((v) => RELOCATION_REGIONS.find((r) => r.value === v)?.label ?? v)
    .join(", ");
}
