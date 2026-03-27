# Router setup and configugration

## Problem:

The router needs to be testable in isolation. router.tsx currently exports one createBrowserRouter instance, tied to the real browser URL — tests need a createMemoryRouter instead (a router that doesn't touch the actual address bar, so tests can start at any arbitrary path and inspect navigation without a real browser).

## Solution:

Rather than duplicating the whole route tree in test files (guaranteed to drift out of sync with the real one), We have to refactor to export the route definitions array separately from the router instance itself:

### Routes File

```ts

// src/app/routes.tsx
import { Navigate } from "react-router-dom";
import { FormLayout } from "./FormLayout";
import { PersonalInfoStep } from "@/steps/personal-info/PersonalInfoStep";
// ...other step imports...
import { STEPS } from "@/lib/steps";

export const routes = [
  { path: "/", element: <Navigate to={`/form/${STEPS[0].path}`} replace /> },
  {
    path: "/form",
    element: <FormLayout />,
    children: [
      { index: true, element: <Navigate to={STEPS[0].path} replace /> },
      { path: "personal-info", element: <PersonalInfoStep /> },
      { path: "experience", element: <ExperienceStep /> },
      { path: "skills-links", element: <SkillsLinksStep /> },
      { path: "uploads", element: <UploadsStep /> },
      { path: "availability", element: <AvailabilityStep /> },
      { path: "review", element: <ReviewStep /> },
    ],
  },
  { path: "*", element: <Navigate to={`/form/${STEPS[0].path}`} replace /> },
];
```

### Router File

```ts
// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";

export const router = createBrowserRouter(routes);
```

### Router Boilerplate

A small shared test helper, to avoid repeating router-boilerplate per file

```ts
// src/test/renderStep.tsx
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "@/app/route/routes";
import { ThemeProvider } from "@/providers/ThemeContext";

export function renderStep(initialPath: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  );
  return router; // returned so a test can inspect router.state.location for redirect assertions
}

```

## Why add `ThemeProvider`

Two provider layers to be aware of:

`ThemeProvider` wraps `RouterProvider` in main.tsx, outside the router entirely — deliberately, so theme state exists app-wide regardless of route. Our routes.tsx extraction if only pulled out the route definitions. And renderStep's helper renders <RouterProvider> directly, with nothing wrapping it. So the `ThemeProvider` needs to be added to the route test helper.

`SidebarProvider` — already correctly inside FormLayout itself, not at the main.tsx level, so it's already part of routes.tsx and needs nothing extra in the route test helper.

## Required configs

`ThemeProvider` requires `window.matchMedia`. `Vitest + JSDOM` does not implement `window.matchMedia` by default. Therefore, rendering `ThemeProvider` fails before the route-guard assertions even run. That's a browser API missing from JSDOM, so it's test-environment configuration. The `test/setup.ts` file needs to add the following defintion of `window.matchMedia`.

```ts
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
```
