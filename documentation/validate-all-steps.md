# `validateAllSteps` — Final Re-validation on Submit

## Purpose

Per-step `furthestUnlockedStep` gating can be bypassed (direct URL entry,
hand-edited localStorage, stale sessions predating a schema change), so
Review's final submit must independently re-validate all five
data-collecting steps against current store state — not trust that they
were valid when last visited.

Also built as a **shared utility** rather than Review-only logic, since
Phase 4's route guard needs the identical "derive first-invalid-step live"
check to decide whether a direct navigation to `/form/:step` is allowed.
One implementation, two callers, avoids two copies of step-schema
orchestration drifting apart over time.

## What it does

```ts
validateAllSteps(data: FormData, files: { resume, coverLetter })
  → { isValid: boolean, firstInvalidStepPath: string | null }
```

Runs each step's own Zod schema against the corresponding slice of
`formStore`'s data (plus the two Uploads schemas against `fileStore`),
in page order, and returns the **first** failing step's path — matching
the doc's "redirect to the first failing step" requirement.

Review itself is intentionally excluded — its own Terms checkbox is
validated by its own separate `useForm`/`reviewSchema`, not this utility.

## The core gotcha: store shape != schema input shape

A step's Zod schema is written to validate what **the live form** hands
it — which isn't always the same shape as what's sitting in the
persisted store. `validateAllSteps` calls schemas directly against raw
store data, so any step where those two shapes diverge needs an explicit
conversion before calling `safeParse`, or validation silently fails on
perfectly valid data.

### Where this bit us: `yearsOfExperience`

- **Store type:** `number | null` (`Experience.yearsOfExperience`)
- **Schema's input type:** `z.string()` — required, because the live
  `<input>` field needs a string-in/number-out coercion chain
  (`.transform().pipe(z.number()...)`) to handle mid-typing state
  correctly.
- **Result:** `experienceSchema.safeParse(data.experience)` — a real
  `number` hitting a schema whose first stage is `z.string()` — fails
  immediately, regardless of whether the number is actually valid.

**Fix** — apply the same store->form conversion `ExperienceStep`'s
`defaultValues` already does, inline before validating:

```ts
experienceSchema.safeParse({
  ...data.experience,
  yearsOfExperience: data.experience.yearsOfExperience?.toString() ?? "",
});
```

### Why Availability's Yes/No fields did _not_ have this problem

Same-looking situation on the surface (`boolean | null` in the store,
transform-adjacent logic in the schema) — but the schema itself,
`z.boolean().nullable().refine(...)`, has an **input type of
`boolean | null`** already. `.refine()` only narrows the _output_ type
(excluding `null` after a successful parse); it never changes what the
schema accepts on the way in. So store data flows in natively — no
conversion needed.

**The distinguishing question, going forward:** does the field's schema
start with a type that _differs_ from the store's type (-> needs a
conversion here), or does it start with the _same_ type and only narrow
via `.refine()` (-> store data flows in as-is)? `yearsOfExperience`'s
string-in/number-out coercion is the former; Yes/No's boolean-in/
boolean-out narrowing is the latter.

## Known ongoing risk

Any future field with an input/output type split (another coerced
numeric field, etc.) will reintroduce this exact bug in
`validateAllSteps` unless the matching conversion is added here too.
Not centralized yet since it's only happened once — worth revisiting
(e.g. a per-step "store shape -> schema input shape" conversion function,
called by both the step's own form and this utility) if it recurs.
