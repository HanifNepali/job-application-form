import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Vitest ships its own defineConfig, re-exported from "vitest/config",
// which is Vite's defineConfig extended with the additional test property already typed in.

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@/..." resolves to "src/...". Node's `path.resolve` (not string concatenation)
      // so this works correctly regardless of OS path separators or where the dev server is invoked from.
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // 1. Enables global test functions like 'describe', 'it', and 'expect' without explicit imports
    globals: true,
    // 2. Simulates a browser environment in Node using jsdom
    environment: "jsdom",
    // 3.  Points to a setup file to extend matchers before tests run
    setupFiles: [path.resolve(__dirname, "./src/test/setup.ts")],
  },
});
