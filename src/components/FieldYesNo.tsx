import { FieldError } from "./FieldError";

// src/components/FieldYesNo.tsx
interface FieldYesNoProps {
  label: string;
  name: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  onBlur?: () => void;
  error?: string;
}

export function FieldYesNo({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
}: FieldYesNoProps) {
  const errorId = `${name}-error`;

  return (
    <fieldset>
      <legend className="mb-1.5 text-md font-medium text-ink">{label}</legend>
      <div className="flex gap-6">
        {[
          { optionValue: true, text: "Yes" },
          { optionValue: false, text: "No" },
        ].map(({ optionValue, text }) => (
          <label
            key={text}
            className="flex items-center gap-2 text-sm text-ink"
          >
            <input
              type="radio"
              name={name}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              onBlur={onBlur}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className="h-4 w-4 border-line text-accent
                focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            {text}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
