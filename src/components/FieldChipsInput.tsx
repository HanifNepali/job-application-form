// import { useState, type KeyboardEvent } from "react";
// import { FieldError } from "@/components/FieldError";

// interface FieldChipsInputProps {
//   label: string;
//   name: string;
//   value: string[];
//   onChange: (next: string[]) => void;
//   onBlur?: () => void;
//   error?: string;
//   placeholder?: string;
// }

// export function FieldChipsInput({
//   label,
//   name,
//   value,
//   onChange,
//   onBlur,
//   error,
//   placeholder,
// }: FieldChipsInputProps) {
//   const [draft, setDraft] = useState("");
//   const errorId = `${name}-error`;

//   const commit = () => {
//     const trimmed = draft.trim();
//     if (trimmed && !value.includes(trimmed)) {
//       onChange([...value, trimmed]);
//     }
//     setDraft("");
//   };

//   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault(); // Enter must not submit the form; "," must not land in the text
//       commit();
//     }
//   };

//   return (
//     <div>
//       <label
//         htmlFor={name}
//         className="mb-1.5 block text-md font-medium text-ink"
//       >
//         {label}
//       </label>
//       <input
//         id={name}
//         name={name}
//         type="text"
//         value={draft}
//         onChange={(e) => setDraft(e.target.value)}
//         onKeyDown={handleKeyDown}
//         onBlur={() => {
//           commit(); // don't discard a typed-but-uncommitted skill on blur
//           onBlur?.(); //RHF's onBlur handler passed as prop
//         }}
//         placeholder={placeholder}
//         aria-invalid={!!error}
//         aria-describedby={error ? errorId : undefined}
//         className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink
//           placeholder:text-ink-muted
//           focus-visible:outline focus-visible:outline-offset-2
//           ${error ? "border-error" : "border-line focus-visible:outline-accent"}`}
//       />
//       <FieldError id={errorId} message={error} />
//     </div>
//   );
// }

import { forwardRef, useState, type KeyboardEvent } from "react";
import { FieldError } from "@/components/FieldError";

interface FieldChipsInputProps {
  label: string;
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
}

export const FieldChipsInput = forwardRef<
  HTMLInputElement,
  FieldChipsInputProps
>(({ label, name, value, onChange, onBlur, error, placeholder }, ref) => {
  const [draft, setDraft] = useState("");
  const errorId = `${name}-error`;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
  };

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
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          commit();
          onBlur?.();
        }}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink
            placeholder:text-ink-muted
            focus-visible:outline focus-visible:outline-offset-2
            ${error ? "border-error" : "border-line focus-visible:outline-accent"}`}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
});

FieldChipsInput.displayName = "FieldChipsInput";
