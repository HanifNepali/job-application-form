# Controlled Form Component Architecture: FieldYesNo

This document details the complete data lifecycle of a controlled radio
input component managed via React Hook Form's `useController` hook and
validated with Zod.

## 🛠 Architectural Overview

The implementation maps native HTML radio inputs onto strict JavaScript
boolean values. It enforces a unidirectional data loop across four
distinct phases:

1. **Initialization** ──► RHF seeds internal state from `defaultValues` ──► `useController` exposes it as `field.value`
2. **The Trigger** ──► User clicks a radio ──► our own `onChange(optionValue)` (a closed-over boolean, not anything read from the DOM) updates RHF's state
3. **Processing** ──► RHF updates its internal cache ──► re-renders the field with the new `field.value`
4. **Visual Sync** ──► `checked={value === optionValue}` reconciles which radio appears selected

---

## 🔁 The Four Phases of the Data Lifecycle

### 1. Initialization & Default Values

```tsx
const { control } = useForm<AvailabilityFormValues>({
  defaultValues: data, // e.g., { residesInJobLocation: null, ... }
});
```

- **Data ingestion:** on mount, RHF reads `defaultValues` to seed both the
  field's starting value and its inferred type.
- **The `undefined` rule:** a field _omitted_ from `defaultValues` starts
  as `undefined`, and an `undefined`-then-later-defined value is exactly
  what triggers React's "component changing from uncontrolled to
  controlled" warning. Explicitly seeding `null` (our "unanswered" state)
  avoids that — every field is controlled from the very first render.
- **Zod independence:** the form's _initial_ runtime value comes entirely
  from `defaultValues`. Zod never runs until the first validation trigger
  (blur, submit, or an explicit `trigger()` call) — it plays no role in
  what's on screen before that.

### 2. The Wiretap Layer (`useController`)

```tsx
const { field, fieldState } = useController({
  name: "residesInJobLocation",
  control,
});
```

- Hooks into RHF's central field registry for one named field.
- Returns `field.value` (current tracked value), `field.onChange` (the
  updater), and `field.onBlur` (fires RHF's validation trigger, timed
  according to the form's configured `mode`).

### 3. The Intercept Layer & Trigger (`onChange`)

```tsx
onChange={() => onChange(optionValue)}
```

- **We never read the native event or its string value at all.** The
  radio inputs here don't even carry a meaningful `value` attribute for
  us to parse — `optionValue` is a plain JS `boolean` already sitting in
  the component's closure (from mapping over `[{optionValue: true, ...},
{optionValue: false, ...}]`). So this isn't "converting a string to a
  boolean" so much as "ignoring the native event entirely and pushing our
  own boolean directly into RHF's state" — sidestepping the
  string/boolean mismatch rather than resolving it inline.

### 4. Visual Reflection (`checked`)

```tsx
checked={value === optionValue}
```

- Strict equality against the current RHF-tracked value determines which
  radio renders as selected.
- `value === true` → "Yes" checked. `value === false` → "No" checked.
  `value === null` → neither expression is true, so both render
  unchecked — this is what gives a genuinely blank initial state instead
  of defaulting to one option.

---

## 💎 Technical Advantages

- **Eliminates schema/DOM type mismatches** — Zod's `z.boolean()` never
  has to see a string, because one never reaches it.
- **Controlled from first render** — no uncontrolled→controlled warning,
  since every field starts as an explicit `null`, never `undefined`.
- **Accessible by construction** — grouped via a native `<fieldset>` /
  `<legend>`, which gives every screen reader correct group-label
  association without hand-wired ARIA relationships.
