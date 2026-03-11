import en from "react-phone-number-input/locale/en.json";
import { getCountries } from "react-phone-number-input";

import type { CountryOption } from "@/types/fields";

export const countryOptions: CountryOption[] = getCountries()
  .map((code) => ({
    value: code,
    label: en[code] ?? code,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
