# React Router `useBlocker`: Registration, Evaluation, and Navigation Flow

## 1. The key idea

`useBlocker()` is a React Router hook that **registers a
navigation-blocking function**. It is not a function that you manually
call every time navigation occurs.

```ts
const blocker = useBlocker(({ currentLocation, nextLocation }) => {
  if (skipNextBlockRef.current) return false;

  return isDirty && currentLocation.pathname !== nextLocation.pathname;
});
```

There are two separate moments:

1.  **Registration** --- during component rendering, `useBlocker()`
    registers the callback with React Router.
2.  **Evaluation** --- when navigation is attempted, React Router
    invokes the registered callback to decide whether navigation should
    be blocked.

---

## 2. What happens when the component renders?

When this executes:

```ts
const blocker = useBlocker(callback);
```

there is not necessarily a navigation attempt.

Conceptually:

```text
Component renders
      ↓
useBlocker(callback)
      ↓
React Router registers/remembers the callback
```

The returned `blocker` object is a control/state object associated with
that registered blocker.

It can expose information and controls such as:

```ts
blocker.state;
blocker.location;
blocker.proceed();
blocker.reset();
```

The modal receives this object:

```tsx
<UnsavedChangesModal blocker={blocker} />
```

The modal does not itself create the blocker. It observes and controls
the blocker that React Router manages.

---

## 3. What happens when the form becomes dirty?

Initially:

```text
isDirty = false
```

The user changes a field.

React Hook Form changes:

```text
isDirty: false → true
```

Because the component subscribes to `isDirty`, the component
re-renders. The `useBlocker()` hook therefore receives the current
`isDirty` value through its callback closure.

Conceptually:

```text
isDirty = true
      ↓
component re-renders
      ↓
useBlocker(callback using isDirty=true)
```

The blocker callback still does not need to execute at this point. It is
evaluated when navigation is attempted.

---

## 4. What happens when the user tries to navigate?

Suppose the user presses the browser Back button.

The sequence is:

```text
User initiates navigation
        ↓
React Router detects navigation
        ↓
React Router checks registered blockers
        ↓
React Router invokes the blocker callback
```

The callback executes:

```ts
({ currentLocation, nextLocation }) => {
  if (skipNextBlockRef.current) return false;

  return isDirty && currentLocation.pathname !== nextLocation.pathname;
};
```

If:

```text
skipNextBlockRef.current = false
isDirty = true
paths are different = true
```

the callback returns:

```ts
true;
```

React Router blocks the navigation.

The blocker state then becomes:

```ts
blocker.state === "blocked";
```

The modal can observe that state and display the confirmation UI.

---

## 5. Why `allowNextNavigation()` works

The hook has:

```ts
const allowNextNavigation = () => {
  skipNextBlockRef.current = true;
};
```

When the user clicks the **Next** button, the form is dirty, but this
navigation is intentional.

The submit handler does:

```ts
allowNextNavigation();
navigate(`/form/${STEPS[1].path}`);
```

The sequence is:

```text
allowNextNavigation()
        ↓
skipNextBlockRef.current = true
        ↓
navigate(...)
        ↓
React Router evaluates the registered blocker
        ↓
callback sees ref.current === true
        ↓
return false
        ↓
navigation proceeds
```

The crucial point is that you do **not** call `useBlocker()` again.

You only change data that the already-registered blocker callback can
read when React Router evaluates it.

---

## 6. Why use a ref?

A ref gives you a mutable value:

```ts
const skipNextBlockRef = useRef(false);
```

Changing:

```ts
skipNextBlockRef.current = true;
```

does not cause a React render.

That is useful here because the value is simply a flag consumed during
navigation evaluation.

---

## 7. Why the flag currently appears to reset automatically

A ref persists across **renders**, but it does not persist after the
component is **unmounted**.

In a route-per-step multi-step form:

```text
PersonalInfoStep
    ↓
navigate()
    ↓
PersonalInfoStep unmounts
    ↓
its ref is destroyed
    ↓
ExperienceStep mounts
    ↓
ExperienceStep gets a new ref
    ↓
new ref.current === false
```

Therefore, if each step is a separate route/component, this can make the
following implementation appear to reset automatically:

```ts
const allowNextNavigation = () => {
  skipNextBlockRef.current = true;
};
```

The flag does not actually reset. The **ref itself is destroyed because
its owning component unmounts**.

If a future routing design keeps the same component mounted across
navigation, the flag could remain `true`. A more defensive
implementation can consume the flag:

```ts
if (skipNextBlockRef.current) {
  skipNextBlockRef.current = false;
  return false;
}
```

---

## 8. Complete mental model

Think of `useBlocker()` as installing a guard:

```text
During render:

Component
   ↓
useBlocker(callback)
   ↓
React Router remembers callback
```

Later:

```text
Navigation attempt
   ↓
React Router asks the registered callback
   ↓
callback evaluates current conditions
   ↓
true  → block
false → allow
```

And the returned `blocker` object is the interface through which the UI
can observe and control the blocked navigation.

The most important distinction is:

> **`useBlocker()` registers the guard; React Router later invokes the
> guard when navigation needs to be evaluated.**

## 9. We do not need it in the "Uploads" page

Uploads never has a "typed but not yet saved" moment at all.

Every other step's flow has a real gap between "typed" and "saved": text lives only in RHF's local state until onSubmit writes it into formStore, so there's a genuine window where navigating away would lose real work. Uploads doesn't have that window — the moment a file is picked, setResume/setCoverLetter fires immediately inside the Controller's onChange, writing straight into fileStore.

There's no separate "commit" step; selecting is saving, from the very first click.
