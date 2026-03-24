import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { beforeEach, afterEach } from "vitest";
import { useFileStore } from "@/store/fileStore";
import { useFormStore } from "@/store/formStore";

// ThemeProvider requires window.matchMedia.
// That's a browser API missing from JSDOM,
// so it's test-environment configuration
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

// Both formStore and fileStore are singletons
// — without resetting them, one test's leftover state (a filled-in Personal Info, an unlocked step)
// would silently leak into the next test and produce confusing, order-dependent failures.
// Since persist also writes to localStorage, that needs clearing too,
// or a saved state could survive across entire test runs, not just individual tests.
beforeEach(() => {
  useFormStore.getState().reset();
  useFileStore.getState().reset();
  localStorage.clear();
});

// Automatically unmounts React trees after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});
