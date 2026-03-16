export interface CountryOption {
  value: string;
  label: string;
}

export interface FileState {
  resume: File | null;
  coverLetter: File | null;
}

export interface ValidationResult {
  isValid: boolean;
  /** Path of the first step that failed, if any — used to redirect. */
  firstInvalidStepPath: string | null;
}
