# React Hook Form: `isDirty`, Subscriptions, and Re-renders

## 1. Does React Hook Form re-render on every input change?

Not necessarily.

One of React Hook Form's important design goals is to minimize
unnecessary React re-renders. Field values can be managed largely
outside React component state.

However, a component **does re-render when it subscribes to a piece of
form state that changes**.

In the code:

```ts
const {
  formState: {
    errors,
    isSubmitting,
    dirtyFields,
    isDirty,
  },
} = useForm<PersonalInfoData>(...);
```

you are explicitly consuming several pieces of `formState`.

Therefore, the component can re-render when those subscribed values
change.

---

## 2. The important `isDirty` transition

Consider the initial state:

```text
isDirty = false
```

The user changes the first field:

```text
First Name: John → Jonathan
```

RHF detects that the current form values differ from the default values:

```text
isDirty: false → true
```

Because the component consumes `isDirty`, that state change can cause
the component to re-render.

Conceptually:

```text
User changes field
       ↓
RHF updates form state
       ↓
isDirty changes false → true
       ↓
component re-renders
       ↓
useUnsavedChangesWarning(isDirty)
       ↓
useBlocker receives the current dirty state
```

---

## 3. What about every subsequent keystroke?

Suppose the user continues typing:

```text
J → Jo → Joh → John
```

After the first modification, the form is already dirty:

```text
isDirty = true
```

Further typing normally does not produce:

```text
true → true → true → true
```

as meaningful `isDirty` state transitions.

So it is inaccurate to say:

> "React Hook Form re-renders the entire component on every keystroke
> because `isDirty` is subscribed."

A more precise statement is:

> **The component is subscribed to `isDirty`, so it re-renders when the
> subscribed `isDirty` state changes.**

The important transition for the navigation blocker is:

```text
false → true
```

not every individual character entered after the form has already become
dirty.

---

## 4. Why RHF is different from a typical controlled form

A conventional controlled input might look like:

```tsx
const [value, setValue] = useState("");

<input value={value} onChange={(e) => setValue(e.target.value)} />;
```

Here, every `setValue()` updates React state and normally causes the
component to render again.

With React Hook Form:

```tsx
<input {...register("firstName")} />
```

RHF can manage the field value without requiring the parent component to
re-render for every value change.

This is one reason RHF can be efficient for large forms.

---

## 5. Subscriptions are the important concept

Your component consumes:

```ts
errors;
isSubmitting;
dirtyFields;
isDirty;
```

Each represents form state that the component is interested in.

For example:

### `isDirty`

```text
clean → dirty
false → true
```

This can trigger a render because you subscribed to it.

### `errors`

Suppose validation produces an error:

```text
errors = {}
        ↓
errors.firstName = "Required"
```

Your component consumes `errors`, so the component needs to update to
display:

```tsx
<FieldTextInput error={errors.firstName?.message} />
```

### `isSubmitting`

When submission starts:

```text
false → true
```

the component needs to update because you use:

```tsx
<Button disabled={isSubmitting}>
```

### `dirtyFields`

You use:

```ts
if (selectedCountry && !dirtyFields.country) {
  setValue("country", selectedCountry, {
    shouldDirty: false,
  });
}
```

So changes to the relevant dirty-field state can also be relevant to
the component.

---

## 6. How this connects to the navigation blocker

Your navigation hook receives:

```ts
useUnsavedChangesWarning(isDirty);
```

The important lifecycle is:

```text
Initial render
    ↓
isDirty = false
    ↓
useBlocker registers blocker callback
```

Then:

```text
User changes a field
    ↓
RHF detects dirty state
    ↓
isDirty: false → true
    ↓
component re-renders
    ↓
blocker callback has current isDirty state
```

But the callback is not necessarily executed immediately.

Later:

```text
User attempts navigation
    ↓
React Router evaluates the registered blocker
    ↓
callback checks isDirty
    ↓
isDirty === true
    ↓
return true
    ↓
navigation is blocked
```

So RHF and React Router are doing two different jobs:

```text
React Hook Form
    ↓
tracks form state
    ↓
isDirty = true

React Router
    ↓
tracks navigation
    ↓
asks blocker whether navigation should proceed
```

Your custom hook connects the two:

```text
RHF isDirty
      ↓
useUnsavedChangesWarning()
      ↓
React Router useBlocker()
      ↓
navigation blocked when appropriate
```

---

## 7. Precise takeaway

Avoid saying:

> "RHF doesn't re-render on input changes."

That is too broad.

Also avoid saying:

> "RHF re-renders the component on every input change."

That is also too broad.

The precise explanation is:

> **React Hook Form minimizes re-renders and allows field values to be
> managed without requiring a parent render for every keystroke.
> Components can subscribe to specific pieces of form state, such as
> `isDirty`, `errors`, or `isSubmitting`. When a subscribed value
> changes, the component can re-render so that the UI reflects that
> change.**

For the blocker, the key subscription is:

```ts
isDirty;
```

and the key transition is:

```text
false → true
```

That is what allows the component to react to the form becoming dirty
without turning every keystroke into an `isDirty`-driven render.
