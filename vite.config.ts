import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@/..." resolves to "src/...". Node's `path.resolve` (not string concatenation)
      // so this works correctly regardless of OS path separators or where the dev server is invoked from.
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
