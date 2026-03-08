import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import "@/index.css";

// RouterProvider replaces the old <App /> entry point entirely — routing
// now owns what renders at the root, rather than a single top-level
// component. There is no more App.tsx; FormLayout is the new root shell.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
