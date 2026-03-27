import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={`h-4 w-4 transition-colors ${isDark ? "text-ink-muted" : "text-ink"}`}
        aria-hidden="true"
      />

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full cursor-pointer
          transition-colors focus-visible:outline 
          focus-visible:outline-offset-2 focus-visible:outline-accent
          ${isDark ? "bg-accent" : "bg-line"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow-card
            transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>

      <Moon
        className={`h-4 w-4 transition-colors ${isDark ? "text-ink" : "text-ink-muted/50"}`}
        aria-hidden="true"
      />
    </div>
  );
}
