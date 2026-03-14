// src/components/FieldCheckboxGroup.tsx
import { FieldError } from "@/components/FieldError";

interface FieldCheckboxGroupOption {
  value: string;
  label: string;
}

interface FieldCheckboxGroupProps {
  label: string;
  name: string;
  options: FieldCheckboxGroupOption[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}

export function FieldCheckboxGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: FieldCheckboxGroupProps) {
  const errorId = `${name}-error`;

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <fieldset>
      <legend className="mb-1.5 text-md font-medium text-ink">{label}</legend>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-sm text-ink"
          >
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className="h-4 w-4 rounded border-line text-accent
                focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            {opt.label}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
