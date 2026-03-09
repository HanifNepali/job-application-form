import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeContext";
import { DARK_MODE } from "@/lib/constants";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === DARK_MODE;

  return (
    <div className="flex items-center gap-2">
      <span
        id="theme-toggle-label"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Mode
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-labelledby="theme-toggle-label"
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   bg-gray-300 dark:bg-gray-600"
      >
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow
                      transition-transform ${isDark ? "translate-x-5" : "translate-x-0.5"}`}
        >
          {isDark ? (
            <Moon className="h-3 w-3 text-gray-700" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-500" />
          )}
        </span>
      </button>
    </div>
  );
};
