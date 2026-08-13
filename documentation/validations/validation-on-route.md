# Validation & Routing Logic — Reference

Covers three interlocking pieces: mount-time validation, the route guard,
and how they compose with `validateAllSteps` and each step's own
submit-time validation. The "what it prevents" sections capture real bugs
each piece fixes, not just the happy path — this went through a few wrong
versions before landing here, and knowing what didn't work is part of why
the final version looks the way it does.

---

## 1. Mount-time validation (`furthestUnlockedStep`-driven `trigger()`)

### The problem it solves

A step can be visited in two very different situations that need
opposite default behavior:

- **A genuinely fresh visit** — the form should stay clean. Dumping
  "required" errors on every field before the user has typed anything
  contradicts the onBlur-first validation philosophy used everywhere
  else in this project.
- **A revisit to a step that was already filled in and passed before,
  but has since become invalid** (stale/tampered data, or — the one case
  this happens through completely normal use — Uploads' files being lost
  on refresh, which is documented, intentional behavior, not a bug).
  Here, staying silent is wrong: the user has no way to know _why_
  they've been sent back here, or what's broken.

### The mechanism

```tsx
const STEP_INDEX = 0; // this step's own position in STEPS (1 for Experience, etc.)
const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

useEffect(() => {
  if (furthestUnlockedStep > STEP_INDEX) {
    trigger(); // no argument = validate the whole step, populate every field's error at once
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // deliberately once-on-mount only
```

No separate flag is used — `furthestUnlockedStep > STEP_INDEX` is a
sufficient signal on its own. Reasoning: the _only_ way
`furthestUnlockedStep` can ever exceed a given step's index is if that
step was successfully submitted at some point in the past (that's the
only thing that ever advances the value — see §3). So:

- `furthestUnlockedStep === STEP_INDEX` → this is the furthest point ever
  reached → a fresh visit → stay quiet.
- `furthestUnlockedStep > STEP_INDEX` → this step was already passed
  before, at least once → if it's invalid _now_, something changed since
  then → show errors immediately.

An earlier version used a separate `validateOnMount: boolean` store
field, set by Review's submit handler right before redirecting to a
failing step. It was dropped once it became clear `furthestUnlockedStep`
already encodes the same distinction on its own — no extra state needed
to keep in sync.

### What it does NOT do

It does not gate navigation — it only decides whether an _already
rendered, already reachable_ step shows its errors immediately or waits
for interaction. Reachability itself is a separate mechanism (§2).

---

## 2. The route guard (`FormLayout`, `furthestUnlockedStep`-based)

### The problem it solves

Without any guard, a step's own URL is directly enterable regardless of
progress — a user could type `/form/review` into the address bar (or
click a Stepper link) having never filled in Personal Info, and land on
a mostly-blank Review page. The guard exists to stop **jumping ahead**
of progress genuinely made.

### The mechanism

```tsx
const location = useLocation();
const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

const currentPath = location.pathname.replace("/form/", "");
const currentIndex = STEPS.findIndex((s) => s.path === currentPath);

if (currentIndex !== -1 && currentIndex > furthestUnlockedStep) {
  return <Navigate to={`/form/${STEPS[furthestUnlockedStep].path}`} replace />;
}
```

Key properties:

- **Render-time redirect (`<Navigate>`), not a `useEffect` +
  `navigate()` call.** An effect-based redirect renders the _wrong_ step
  first, lets the browser paint it, and only then redirects — a visible
  flash. Since the check here is a pure, side-effect-free comparison,
  it's safe to run directly during render, so the disallowed step's
  content is never constructed as an element at all when a redirect is
  about to happen.
- **`{ replace: true }`** — swaps the current history entry instead of
  pushing a new one, so the back button doesn't re-trigger the same
  redirect in a loop.
- **Only compares against `furthestUnlockedStep` — runs no Zod
  validation, reads no form data.** Deliberately cheap, and deliberately
  _not_ trying to judge whether earlier steps are currently valid.

### What it does NOT do (this was gotten wrong once before landing here)

**Earlier version — wrong:** the guard additionally called
`validateAllSteps` and blocked forward navigation whenever _any_ earlier
step was currently invalid — not just when jumping past
`furthestUnlockedStep`. This produced bad UX: e.g.,

Sample use case:
<strong>a user who fills the whole form, reaches Review, goes back to Uploads to remove their resume,would then be forcibly redirected back to Uploads the moment they tried to use the sidebar to reach _any_ other already-unlocked step (Skills & Links, Availability, Review) — even though they'd legitimately reached those steps before and should be free to browse between them.</strong>

**The fix:** reachability and current validity are different questions.
The guard now only answers "have you unlocked this far" — never "is
everything before this currently valid." That second question belongs
solely to:

- Each step's own `handleSubmit` — the actual forward-progress gate
  ("Next" won't advance on invalid data; this is what stops progress,
  not the sidebar or the guard).
- Review's submit handler — the actual point where "is _everything_
  currently valid" gets checked, deliberately, once, right before the
  real submit (§4).

This split is also why the requirements doc's literal wording — _"a
previously valid step is now invalid → redirect to the first step with
errors"_ — is deliberately **not** implemented as a route-guard-level
rule. Applied to every navigation, it produces the bad UX above; applied
only at the moment of final submit, it's the correct defense-in-depth
check. Treat this as an intentional refinement of that line, not an
oversight.

### A useful side effect

This same simple rule also fully covers the Uploads-after-refresh case
with zero special-casing: refresh makes Uploads invalid (files aren't
persisted) exactly the same way manually removing a file does. Under
this model, both are just "an already-unlocked step that currently
happens to be invalid" — freely browsable either way, only actually
caught at final submit. No Uploads-specific branch needed anywhere in
the guard.

---

## 3. `furthestUnlockedStep` itself — how it advances

```ts
setFurthestUnlockedStep: (stepIndex) =>
  set((state) => ({
    furthestUnlockedStep: Math.max(state.furthestUnlockedStep, stepIndex),
  })),
```

Called by each step's `onSubmit`, with the _next_ step's index, only
after that step's own validation has passed. `Math.max` is deliberate:
going back to fix an earlier step and re-passing it must never pull this
value backward — it tracks the furthest point ever reached, not the
current position. This is also why it's a reliable proxy for "was this
step ever successfully completed" in both §1 and §2 above — it only ever
moves forward, and only as a result of a real, validated submission.

---

## 4. `validateAllSteps` and Review's submit — the actual final gate

```ts
export function validateAllSteps(
  data: FormData,
  files: FileState,
): ValidationResult;
```

Re-runs all five data-collecting steps' own Zod schemas (plus Uploads'
two file schemas) against **current** store/file state — independent of
`furthestUnlockedStep`, independent of whatever passed before. This is
the requirements doc's "final submit re-validates everything ...
defense-in-depth, not just gate-based trust" rule, and it's the _only_
place in the app where "is everything currently valid, right now" is
actually asked.

```tsx
// ReviewStep.tsx
const onSubmit = (values: ReviewData) => {
  const { isValid, firstInvalidStepPath } = validateAllSteps(data, {
    resume,
    coverLetter,
  });

  if (!isValid && firstInvalidStepPath) {
    navigate(firstInvalidStepPath);
    return;
  }

  updateReview(values);
  alert("Application submitted successfully!"); // placeholder — real async loading/success/error state deferred
};
```

Navigating to `firstInvalidStepPath` is sufficient on its own — no flag
needs to be set beforehand. The destination step's own mount effect (§1)
independently determines it should validate immediately, because
`furthestUnlockedStep` will necessarily be greater than that step's
index (it was passed once before; that's the only way it could be
invalid-but-previously-unlocked in the first place).

Given the route guard (§2) already requires every step up to Review to
have been successfully passed at least once to _reach_ Review at all,
this check is, in ordinary use, almost always a no-op by the time
someone clicks Submit — it exists specifically to catch the tamper/drift/
refresh edge cases the doc calls out, not to do routine work on the happy
path.

---

## Summary — what answers which question

| Question                                              | Answered by                                               |
| ----------------------------------------------------- | --------------------------------------------------------- |
| Can the user reach this URL at all?                   | Route guard (§2), via `furthestUnlockedStep`              |
| Should this step show errors immediately on arrival?  | Mount-time `trigger()` (§1), via `furthestUnlockedStep`   |
| Can the user click "Next" from here?                  | That step's own `handleSubmit` / Zod schema               |
| Is the _entire_ application actually valid right now? | `validateAllSteps`, called only from Review's submit (§4) |
