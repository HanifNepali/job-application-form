# `useFocusTrap` — Implementation Reference

Shared hook powering keyboard focus-trapping for both the mobile Sidebar
drawer and the Unsaved Changes modal. Documents what it does, how it's
used by each caller, and the specific bugs its design choices work
around.

---

## What it solves

Any overlay that sits on top of the page (a modal, a drawer) needs three
things to be keyboard-accessible:

1. **Focus moves inside it the moment it opens** — a keyboard user
   shouldn't have to blindly Tab from wherever they were before.
2. **Tab/Shift+Tab stays contained inside it while open** — without this,
   a keyboard user can Tab straight through the overlay into the page
   content behind it, which is invisible/inert while the overlay is up.
3. **Focus returns to wherever it came from once it closes** — otherwise
   focus is silently lost (resets to `<body>`), which is disorienting.

`useFocusTrap` handles all three, plus which specific element gets
initial focus.

---

## API

```ts
function useFocusTrap<T extends HTMLElement>(
  isActive: boolean,
  options?: { initialFocusSelector?: string },
): RefObject<T>;
```

- **`isActive`** — whether the trap should currently be engaged. The hook
  does nothing at all while `false`; all of its behavior is gated behind
  an internal `useEffect` keyed on this value.
- **`options.initialFocusSelector`** — an optional CSS selector (not a
  ref — see "Why a selector, not a ref" below) identifying which element
  inside the container should receive focus first. If omitted, or if
  nothing inside the container matches it, falls back to the first
  naturally focusable element.
- **Return value** — a `ref` object. The caller attaches this directly to
  the JSX element that is the trap's container (`ref={containerRef}`).

---

## Usage — the two current callers

### `UnsavedChangesModal`

```tsx
const isOpen = blocker.state === "blocked";
const containerRef = useFocusTrap<HTMLDivElement>(isOpen, {
  initialFocusSelector: "[data-autofocus]",
});
```

```tsx
<div ref={containerRef} tabIndex={-1} role="alertdialog" ...>
  ...
  <Button variant="outline" data-autofocus onClick={() => blocker.reset?.()}>
    Stay on this page
  </Button>
  ...
</div>
```

`data-autofocus` marks the **safe, non-destructive** button ("Stay") as
the preferred initial focus target — deliberately not just "whichever
button happens to be first in the DOM." See the separate Unsaved Changes
Modal design doc for the reasoning behind that choice.

### `Sidebar` (mobile drawer)

```tsx
export function Sidebar({ children }: { children: ReactNode }) {
  const { isOpen, close } = useSidebar();
  const containerRef = useFocusTrap<HTMLElement>(isOpen, {
    initialFocusSelector: "[data-autofocus]",
  });

  return (
    <aside ref={containerRef} tabIndex={-1} ...>
      {children}
    </aside>
  );
}
```

Here, `data-autofocus` is applied inside `Stepper` (a child passed into
`Sidebar`, not something `Sidebar` renders itself) — specifically on the
**currently active step's link**, riding on the same `isActive` boolean
`Stepper` already computes for `aria-current="step"`:

```tsx
<Link
  to={`/form/${step.path}`}
  data-autofocus={isActive ? true : undefined}
  aria-current={isActive ? "step" : undefined}
  ...
>
```

Using `undefined` rather than `false` for inactive steps matters: React
omits the attribute from the DOM entirely when the value is `undefined`,
so `container.querySelector('[data-autofocus]')` cleanly finds exactly
one element (the active step), with no extra filtering needed.

Focusing the _active_ step rather than always the first step is
deliberate — if a user on step 4 opens the drawer, jumping focus to step
1 would be a disorienting default; focusing wherever they already are is
the more natural choice, and it's still correct on step 1 itself.

**Note on scope:** the hook is only ever engaged while `isOpen` is true,
which only happens via the mobile hamburger trigger. At desktop width the
sidebar is permanently visible (not an overlay), so the trap never
activates there — no separate breakpoint check needed inside the hook
itself, since `isOpen` already only ever becomes true in the mobile case.

---

## Inner workings

```ts
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean,
  options: UseFocusTrapOptions = {},
) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const { initialFocusSelector } = options;

  useEffect(() => {
    if (!isActive) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const preferredTarget = initialFocusSelector
      ? container.querySelector<HTMLElement>(initialFocusSelector)
      : null;

    (preferredTarget ?? getFocusable()[0] ?? container).focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const elements = getFocusable();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isActive, initialFocusSelector]);

  return containerRef;
}
```

### Step by step

1. **Before doing anything, remember what was focused.** `document.activeElement`
   is captured into `previouslyFocusedRef` first — this is what gets
   refocused later when the trap deactivates (the "give focus back" half
   of the contract).
2. **Resolve the initial focus target.** `preferredTarget` (via the
   selector) wins if present and found; otherwise the first naturally
   focusable element inside the container; otherwise the container itself
   (see "Why `tabIndex={-1}`" below).
3. **A single `keydown` listener on `document`, not the container,
   handles the actual trapping.** On every `Tab`/`Shift+Tab`, it
   recomputes the current list of focusable elements (not cached — see
   "Why re-query every time" below) and manually wraps focus: `Shift+Tab`
   on the first element jumps to the last; `Tab` on the last jumps to the
   first. `e.preventDefault()` is what stops the browser's own default
   Tab behavior from escaping the container in either direction.
4. **Cleanup, on deactivation or unmount:** removes the listener, and
   restores focus to whatever `previouslyFocusedRef` captured in step 1.

### Why `FOCUSABLE_SELECTOR` is a broad, explicit list

```ts
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
```

There's no built-in browser API for "give me all focusable elements" —
this has to be hand-enumerated. Each clause excludes the specific case
that would make an element _look_ focusable but not actually be reachable
by Tab (a `disabled` button, an element with `tabindex="-1"`).

### Why `tabIndex={-1}` on the container itself

`tabIndex={-1}` makes an otherwise non-interactive element (a `<div>` or
`<aside>`) **programmatically** focusable via `.focus()`, without adding
it to the normal Tab order. This matters as the last-resort fallback
target: if a container genuinely has no focusable children yet (an edge
case, but possible), focus still needs to land _somewhere_ inside it
rather than silently failing — the container itself is that last resort.

### Why a CSS selector for `initialFocusSelector`, not a ref

An earlier version of this API took a ref directly
(`{ initialFocusRef: someRef }`), created in the calling component and
passed into the hook. This reintroduced the same class of false-positive
"Cannot access refs during render" error hit earlier in the project with
`Controller`/`useController` fields (React Compiler's static analysis
flags ref objects crossing a function-call boundary, even when the usage
is actually safe). Using a plain string selector avoids that entirely —
no ref-shaped value ever leaves the component that renders the target
element; `useFocusTrap` just runs its own `querySelector` internally,
entirely on its own side of any boundary.

### The one CSS addition this requires, and why

```css
[data-autofocus]:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

Every focusable element elsewhere in this project uses `focus-visible:outline`,
not `focus:outline` — by design, so mouse users don't see focus rings on
click. But `:focus-visible`'s browser heuristic generally expects a
focus event to be _preceded by a real keyboard action_ to qualify as
"visible-worthy" — a `.focus()` call made entirely from JavaScript (as
this hook does on open) is frequently judged as not visible-worthy and
suppressed, even though the element genuinely has focus. This rule
targets specifically the element marked `data-autofocus`, forcing its
ring to show regardless of how focus was triggered — correct here
because a freshly-opened overlay's initial focus should be visible to
every user, not just keyboard users, per standard dialog accessibility
guidance (not a general override of the `focus-visible`-only convention
used everywhere else).
