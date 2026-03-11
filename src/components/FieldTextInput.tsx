import { forwardRef, type InputHTMLAttributes } from "react";
import { FieldError } from "@/components/FieldError";

interface FieldTextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

export const FieldTextInput = forwardRef<HTMLInputElement, FieldTextInputProps>(
  ({ label, name, error, className = "", ...props }, ref) => {
    const errorId = `${name}-error`;

    return (
      <div>
        <label
          htmlFor={name}
          className="mb-1.5 block text-md font-medium text-ink"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={name}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink
            placeholder:text-ink-muted
            focus-visible:outline focus-visible:outline-offset-2
            ${error ? "border-error" : "border-line focus-visible:outline-accent"}
            ${className}`}
          {...props}
        />

        <FieldError id={errorId} message={error} />
      </div>
    );
  },
);

FieldTextInput.displayName = "FieldTextInput";
