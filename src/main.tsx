// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeContext";
import { router } from "./app/route/router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
      ThemeProvider wraps the router (not the other way around) because
      theme is app-wide state that no route-specific logic depends on —
      it just needs to be available to every component in the tree,
      including ones rendered outside <Outlet /> like a future modal
      or toast. Wrapping outside RouterProvider also means theme survives
      route changes untouched, since it isn't part of the routing tree.
    */}
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
