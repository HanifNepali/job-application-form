import { forwardRef, type InputHTMLAttributes } from "react";
import { FieldError } from "@/components/FieldError";

interface FieldCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

export const FieldCheckbox = forwardRef<HTMLInputElement, FieldCheckboxProps>(
  ({ label, name, error, className = "", ...props }, ref) => {
    const errorId = `${name}-error`;

    return (
      <div>
        <label
          htmlFor={name}
          className="flex items-center gap-2 text-sm text-ink"
        >
          <input
            ref={ref}
            type="checkbox"
            id={name}
            name={name}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`h-4 w-4 rounded border-line text-accent
              focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent
              ${className}`}
            {...props}
          />
          {label}
        </label>

        <FieldError id={errorId} message={error} />
      </div>
    );
  },
);

FieldCheckbox.displayName = "FieldCheckbox";
