import { forwardRef, type SelectHTMLAttributes } from "react";
import { FieldError } from "@/components/FieldError";
import { ChevronDown } from "lucide-react";

interface FieldSelectOption {
  value: string;
  label: string;
}

interface FieldSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: FieldSelectOption[];
  placeholder?: string;
  error?: string;
}

export const FieldSelect = forwardRef<HTMLSelectElement, FieldSelectProps>(
  (
    { label, name, options, placeholder, error, className = "", ...props },
    ref,
  ) => {
    const errorId = `${name}-error`;

    return (
      <div>
        <div className="relative">
          <label
            htmlFor={name}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            {label}
          </label>

          <select
            ref={ref}
            id={name}
            name={name}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            // defaultValue="" + a disabled placeholder option is what makes an
            // unselected native <select> show placeholder text instead of
            // silently defaulting to the first real option. RHF's register()
            // doesn't fight this since it only wires onChange/onBlur/ref, not
            // the initial DOM value.
            defaultValue=""
            className={`w-full appearance-none rounded-md border bg-surface px-3 py-2 pr-9 text-sm text-ink
      focus-visible:outline focus-visible:outline-offset-2
      ${error ? "border-error" : "border-line focus-visible:outline-accent"}
      ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-2/3 h-4 w-4 -translate-y-1/2 text-ink-muted"
          />
        </div>

        <FieldError id={errorId} message={error} />
      </div>
    );
  },
);

FieldSelect.displayName = "FieldSelect";
