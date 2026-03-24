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
