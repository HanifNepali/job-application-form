# Unsaved Changes Modal — Design Choices

Reference doc for why the modal is a simple two-button confirm, and why
that's sufficient given how navigation is already constrained elsewhere
in the app (route guard, `furthestUnlockedStep`).

---

## Two buttons only: "Stay on this page" / "Leave without saving"

No third "Save and leave" button, despite that being a common pattern
elsewhere.

**Why it doesn't fit here:** "save" would mean force-running the current
step's own `handleSubmit`, which only succeeds if the step is currently
_valid_. But the entire scenario this modal exists for is "user has
unsaved changes" — which includes the case where those changes are
mid-edit and invalid (a half-typed email, an empty required field). A
"Save and leave" button would either:

- silently fail with no explanation, or
- need its own inline error-surfacing logic bolted onto a modal that was
  never built to show field-level errors

Real added complexity for a button that can't always do what it promises.
Two clear, always-safe options is the better fit: **leave** (discard) or
**stay** (fix and save normally via the real Next/Submit button already
on the page).

---

## Why "Leave without saving" is always safe to offer

The safety of this button depends on exactly which navigation triggered
the modal. Both possible cases turn out to be safe, for related but
distinct reasons.

### Case 1 — Backward navigation

The target step is already unlocked (it must be, to navigate back to it
at all — `furthestUnlockedStep` only ever grows, never shrinks). Leaving
is safe here specifically because the **destination step's own
already-persisted data is completely untouched** — only the step being
left loses its uncommitted edits. Nothing about the guard or
`furthestUnlockedStep` regresses.

### Case 2 — Forward navigation (sidebar or browser Forward only)

Worth stating the sharper version, since "next step already unlocked"
alone understates it: this can **only** happen via the sidebar or
browser Forward — never by clicking Next/Submit itself, since that _is_
the save action. A user can never reach this modal by clicking Next,
because a successful submit resolves the dirty state before any
navigation happens.

So Case 2 is specifically: _sidebar-jump or Forward-button to an
already-unlocked later step, while the current step has uncommitted
edits._ Leaving is safe by the same logic as Case 1 — the destination's
data is unaffected; only the abandoned step's in-progress edits are lost.

### The case that's excluded entirely, not just handled

Navigating to a step that **isn't yet unlocked** can't reach this modal
at all — the route guard blocks that outright, redirecting before the
target step ever renders, regardless of dirty state.

This means the guard and this modal operate on fully disjoint
conditions:

| Condition                                        | Handled by                                                    |
| ------------------------------------------------ | ------------------------------------------------------------- |
| Target step not yet unlocked                     | Route guard — redirects before render, dirty state irrelevant |
| Target step already unlocked, current step dirty | This modal — binary leave/stay choice                         |

Because those two conditions never overlap, the modal never has to
reason about whether the _destination_ step is valid or reachable — by
the time it's ever shown, that question has already been settled
elsewhere. This is exactly what keeps the modal safe to build as a
simple, unconditional binary choice.
