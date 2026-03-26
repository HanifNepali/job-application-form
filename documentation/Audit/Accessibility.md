# Accessibility Checklist & Audit

Documents what's implemented, what was fixed during this audit, and what
remains a known, accepted gap — organized by category, with references
to the specific place in the codebase each item lives. Written as an
audit of an already-built app, not a generic pre-build checklist.

---

## Keyboard navigation

- **Full keyboard operability across all six steps** — every field
  (`FieldTextInput`, `FieldSelect`, `FieldCheckbox`, `FieldCheckboxGroup`,
  `FieldYesNo`, `FieldChipsInput`, `FieldFileInput`) is a native,
  keyboard-operable HTML control (`<input>`, `<select>`, `<fieldset>` +
  radios/checkboxes) — no custom widgets reinventing keyboard handling
  from scratch.
- **Two focus-trapped overlays** — the Unsaved Changes modal and the
  mobile Sidebar drawer, via the shared `useFocusTrap` hook: Tab/Shift+Tab
  wraps inside the open container, initial focus moves to a deliberately
  chosen target (`data-autofocus`), and focus restores to whatever was
  focused before on close. See `use-focus-trap.md` for full mechanics.
- **Escape-to-close** — both the Unsaved Changes modal and the Sidebar
  drawer close on Escape (Sidebar's was a gap identified and fixed during
  this audit — previously only the modal had it).
- **Skip-to-content link** — added during this audit. Visually hidden
  until focused (`sr-only focus:not-sr-only`), first Tab stop on every
  page, jumps past the mobile header and Sidebar straight to `<main>`.
  Reuses the real `Button` component rather than hand-styled markup, so
  it stays visually consistent with the rest of the app automatically.

## Screen reader semantics

- **`<fieldset>` / `<legend>`** — used for `FieldYesNo` and
  `FieldCheckboxGroup`, giving every screen reader correct group-label
  association for free, with no manual ARIA wiring needed.
- **`role="alert"` on `FieldError`** — satisfies the requirements doc's
  aria-live announcement rule per-field. Only exists in the DOM when a
  message is present, so its _appearance_ is the trigger — no separate
  live-region plumbing needed elsewhere.
- **`role="alertdialog"` + `aria-modal` + `aria-labelledby` +
  `aria-describedby`** — both the Unsaved Changes and Reset Confirmation
  modals use this pattern (not plain `role="dialog"`), specifically
  because both are decision-demanding warnings, which `alertdialog` is
  built to convey.
- **`aria-current="step"`** on the Stepper's active step link.
- **`aria-invalid` / `aria-describedby`** — wired consistently across
  every `Field*` primitive, conditionally set (`undefined`, not a
  false-but-present description, when there's no error).
- **`<dl>` / `<dt>` / `<dd>`** on Review's summary sections — genuinely a
  list of label/value pairs, using the semantic element built for that,
  rather than generic `<div>`s with visual-only styling.
- **`aria-label`** — used where a control has no visible text of its own
  (`ThemeToggle`, close buttons using only an icon, `ChipList`'s
  per-chip remove button using the item's own name: `Remove {item}`).

## Focus management

- **Initial focus targeting** — both modals and the Sidebar drawer focus
  a deliberately chosen element on open, not just "whatever's first in
  the DOM": the Unsaved Changes modal focuses "Stay on this page" (the
  safe action), the Reset modal focuses "Keep Editing" (same principle),
  and the Sidebar focuses the currently active step's link (not always
  step 1).
- **Programmatic-focus visibility fix** — `:focus-visible`'s browser
  heuristic often doesn't treat a JS-triggered `.focus()` call as
  "visible-worthy" (it generally expects a preceding keyboard event),
  which made initial focus on modal open invisible despite genuinely
  having focus. Fixed with a targeted `[data-autofocus]:focus` rule that
  forces the ring regardless of trigger — correct here since a freshly
  opened overlay's initial focus should be visible to every user, not
  just keyboard users specifically.

## Form-specific patterns

- **Validation timing** — onBlur-first, onChange-after-error, per the
  requirements doc, avoiding premature error noise on fields the user
  hasn't reached yet. (Phone is a documented, deliberate exception — see
  Known Gaps.)
- **`noValidate` + Zod as the single source of truth** — prevents the
  browser's native validation UI from firing alongside Zod's and showing
  two conflicting error styles.
- **Mount-time error visibility** — a step revisited after a failed
  final-submit validation shows its errors immediately on arrival
  (`furthestUnlockedStep`-driven `trigger()`), rather than requiring the
  user to guess what's wrong or re-trigger validation themselves.

## Motion

- **`prefers-reduced-motion` support** — added during this audit. A
  blanket rule collapsing all animation/transition durations to
  near-zero for users with this OS-level preference set, covering the
  Sidebar's slide transition and any future animated element project-wide
  (deliberately global rather than per-component, so nothing needs to
  remember to add the guard individually).

## Color contrast (WCAG AA — 4.5:1 normal text, 3:1 large text/UI)

Actual ratios calculated against the real token values, not assumed.

**Passing, no action needed:**

| Pair                                    | Light       | Dark        |
| --------------------------------------- | ----------- | ----------- |
| `ink` on `canvas` / `surface`           | 16.3–17.7:1 | 15.5–17.4:1 |
| `ink-secondary` on `canvas` / `surface` | 7.1–7.7:1   | 6.6–7.5:1   |
| `accent-text` on `accent` (buttons)     | 17.7:1      | 16.1:1      |

**Failures found and fixed during this audit:**

- **`ink-muted` (light mode)** was `#a1a1aa` — ~2.35–2.56:1, a clear
  failure for genuinely informative text (Stepper descriptions, "No
  skills added yet," Review's "Not provided" fallback). Changed to
  `#6b6b70` (reusing dark mode's existing muted value) → **4.87:1 on
  canvas, 5.30:1 on surface**, passing with margin.
- **`ink-muted` (dark mode)** `#6b6b70` was borderline (~3.2–3.6:1,
  under the 4.5:1 normal-text threshold). Retained as-is after the light
  mode value was aligned to it — no further change made; flagged here as
  a value worth revisiting if a stricter AA audit is ever required, since
  it clears the 3:1 large-text threshold but not the 4.5:1 normal-text
  one.
- **`error` on `canvas` (light mode)** was `#dc2626` — 4.43:1, a narrow
  fail against the page background specifically (passed against
  `surface` at 4.83:1, but `FieldError` renders in normal page flow,
  which sits on `canvas`). Changed to `#b91c1c` → **5.94:1 on canvas,
  6.47:1 on surface**.
- Dark mode's `error` color (`#f87171`) was already passing (6.1–6.9:1)
  — untouched.

**Known, accepted tradeoff — not fixed:**

- **`--color-line` (borders)** against `canvas`/`surface` is only
  ~1.2–1.3:1 in light mode — under the 3:1 WCAG 1.4.11 guideline for
  non-text UI component boundaries. This is a deliberate visual choice
  common in minimalist design systems, where
  spacing and labels still convey structure without relying on the
  border alone. Not changed without explicit design sign-off, since
  darkening every border project-wide is a visual-identity change, not a
  narrow token fix.

## Known, documented gaps (not resolved)

- **Phone field focus-on-error** — if Phone is the first invalid field
  on submit, it does not receive focus the way every `register()`-based
  field does automatically via RHF's `shouldFocusError`. Root cause:
  `react-phone-number-input`'s forwarded ref does not resolve to
  something RHF's built-in focus mechanism can call `.focus()` on.
  Multiple fix attempts (`field.ref` forwarding, a manual
  `getElementById` fallback scoped to "Phone is first invalid") were
  tried and did not work in the browser.So it is a known limitation.
