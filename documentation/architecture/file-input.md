# File Upload Handling — How `FieldFileInput` Works

Reference doc for the Uploads step's file-picker implementation
(`FieldFileInput.tsx`, wired into `UploadsStep.tsx`). Written to capture
_why_ it's built this way, not just what the code does — the design is a
direct consequence of a browser constraint that isn't obvious until you
hit it.

---

## The core constraint: file inputs can't be controlled

A native `<input type="file">`'s `value` can **never** be set
programmatically to represent an actual file — not by React, not by any
JS. Browsers enforce this as a security restriction: arbitrary code must
never be able to make it _look like_ a user selected a local file when
they didn't. The only two things you can ever do with a file input's
`value` are:

- **Read it** (or, in practice, read `e.target.files[0]` in `onChange`,
  which is where the real `File` object actually comes from)
- **Reset it to `""`**, which clears the native selection

This means a "controlled file input," in the normal React sense
(`<input value={someFile}>`), does not exist and cannot exist. Everything
below is working around that one fact.

## The two-state-store pattern

Since the input itself can't hold controlled state, the selected `File`
is tracked in **two places**, updated together, in the same `onChange`:

1. **RHF's `Controller` field** (`field.value` / `field.onChange`) — this
   is what lets `resumeSchema` / `coverLetterSchema` validate the file via
   `zodResolver`, and what populates `errors.resume` / `errors.coverLetter`
   for the `FieldError` component to render.
2. **`fileStore`** (Zustand, _not_ persisted to localStorage — see
   `fileStore.ts` for why: `File` objects aren't JSON-serializable, and
   uploads are documented as session-only by design) — this is the actual
   source of truth other parts of the app read from once they exist (e.g.
   the Review step's summary won't have access to `UploadsStep`'s local
   RHF state after navigating away, so it has to read the file from
   `fileStore` directly).

```tsx
onChange={(file) => {
  field.onChange(file); // → RHF / Zod validation
  setResume(file);      // → fileStore, the durable source of truth
  trigger("resume");    // → force immediate validation (see below)
}}
```

`FieldFileInput` itself doesn't know or care which of these it's
displaying — it just renders whatever `value: File | null` it's handed.
It happens to be wired to `field.value` today; it would work identically
wired to `fileStore`'s value instead, since the two are always kept equal.

## Why validation triggers immediately, unconditionally

Every text-based field in this project validates onBlur-first, to avoid
flagging errors mid-keystroke. A file selection has no "mid-keystroke"
equivalent — the moment `onChange` fires, the user has already made a
complete, discrete choice (valid or not). So `trigger(fieldName)` runs on
every change, with no guard condition — unlike Phone's
`if (errors.phone) trigger("phone")`, which specifically exists to avoid
validating a number that's still being typed.

## UI structure: input and filename badge as siblings, not swapped

Earlier version of this component conditionally rendered _either_ the
native `<input type="file">` _or_ a filename+Remove display, never both.
That broke "replace a file without removing it first" — once a file was
selected, the picker disappeared from the DOM, so there was no control
left to trigger a new selection.

Current version keeps the native input **permanently mounted**, with the
filename badge rendered as a sibling next to it (not instead of it):

```
[Choose File]  [resume.pdf (240 KB)  ✕]
```

- The native input's own "no file chosen" text is visually clipped via a
  fixed width + `overflow-hidden` on the input itself, since our own
  filename badge is the thing meant to communicate what's selected.
- Selecting a new file while one is already present simply replaces it —
  no special-case code needed, since `onChange` always fires with
  whatever the newly selected file is, and both state stores just get
  overwritten with the new value.

## Why Remove needs a manual ref reset, not just clearing state

```tsx
const inputRef = useRef<HTMLInputElement>(null);

const handleRemove = () => {
  onChange(null);
  if (inputRef.current) inputRef.current.value = "";
};
```

This is a real, standard `useRef` — not related to the `field.ref`
forwarding issues encountered elsewhere in this project (Phone's ref not
resolving to a focusable element, React 19's ref-during-render
restriction on the Skills chips input). This ref exists purely to call
the browser's own reset mechanism directly.

**Why it's necessary:** browsers do not fire a file input's `change`
event if the user selects the _same file_ twice in a row without the
input being cleared in between — from the browser's perspective, the
`value` didn't change, so there's nothing to notify. Clearing only our
React/Zustand state to `null` would update our UI correctly, but the
native input would still silently believe that file is selected — so if
the user then tried to re-pick that exact same file, nothing would
happen, because the browser sees no change. Explicitly resetting
`inputRef.current.value = ""` clears the browser's own memory of the
selection, which is what makes re-selecting the same file work correctly
after a Remove.

## Required (Resume) vs. optional (Cover Letter) — two schemas, not one

```ts
export const resumeSchema = z
  .instanceof(File, { message: "Resume is required" })
  .superRefine(/* type/size checks */);

export const coverLetterSchema = z
  .instanceof(File)
  .superRefine(/* same type/size checks */)
  .nullable(); // the entire difference: absence is valid
```

Kept as two schemas rather than one shared schema with a flag, because
"required" vs "optional" changes _which checks apply at all_ — an absent
optional file skips type/size validation entirely (nothing to check); an
absent required file is itself the error. Trying to express both cases
in one schema would need its own internal branching anyway.

## The `null` vs `undefined` seam (store ↔ form ↔ schema)

Three layers, three slightly different conventions for "no file":

- **`fileStore`**: `File | null` — `null` is the explicit "nothing
  selected / removed" state.
- **RHF's `defaultValues`**: fields are inferred as `File | undefined`
  by default (RHF's `DefaultValues<T>` helper treats all fields as
  possibly-unset) — `undefined`, not `null`.
- **Zod's validated output**: `resumeSchema` → `File` only (required,
  never `null`); `coverLetterSchema` → `File | null` (explicitly
  `.nullable()`).

Resume hits a real mismatch here (`null` fits neither `File` nor
`undefined`) and needs explicit conversion at the two seams where these
meet:

```tsx
// Store → form:
defaultValues: { resume: resume ?? undefined, coverLetter }

// Form → component prop:
<FieldFileInput value={field.value ?? null} ... />
```

Cover Letter needs no equivalent conversion — `.nullable()` means its
type is `File | null` consistently across all three layers already.
