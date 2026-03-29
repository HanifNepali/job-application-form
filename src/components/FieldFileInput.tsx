import { useRef } from "react";
import { X } from "lucide-react";
import { FieldError } from "@/components/FieldError";
import { formatFileSize } from "@/lib/utils";

interface FieldFileInputProps {
  label: string;
  name: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  accept?: string;
}
export function FieldFileInput({
  label,
  name,
  value,
  onChange,
  error,
  accept = ".pdf,.doc,.docx",
}: FieldFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `${name}-error`;

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = ""; // clears native selection, see note above
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-md font-medium text-ink"
      >
        {label}
      </label>

      <div className="flex flex-wrap items-center">
        {/* w-25 i.e 100px + overflow-hidden deliberately clips the browser's own
            "no file chosen" / filename text after the button — we render
            our own filename badge instead, so the native label would just
            be redundant, not informative. */}
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="w-25 overflow-hidden text-sm
            file:cursor-pointer file:rounded-md file:border-0 file:bg-accent
            file:px-3 file:py-1.5 file:text-sm file:text-accent-text
            focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent"
        />

        {value && (
          <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink ml-2">
            <span className="max-w-55 truncate">
              {value.name}{" "}
              <span className="text-ink-muted">
                ({formatFileSize(value.size)})
              </span>
            </span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove ${value.name}`}
              className="text-ink-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <FieldError id={errorId} message={error} />
    </div>
  );
}
