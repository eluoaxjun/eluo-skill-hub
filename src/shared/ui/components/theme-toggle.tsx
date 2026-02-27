"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="테마 전환"
      className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {resolvedTheme === "dark" ? (
        <Sun data-testid="sun-icon" className="h-5 w-5" />
      ) : (
        <Moon data-testid="moon-icon" className="h-5 w-5" />
      )}
    </button>
  );
}
