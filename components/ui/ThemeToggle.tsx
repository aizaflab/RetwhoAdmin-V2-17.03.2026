"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { SunIcon, MoonIcon } from "@/components/icons/Icons";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    // Simple toggle between light and dark only
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "relative size-8 rounded-[11px] center cursor-pointer",
        "bg-gray-light dark:bg-darkPrimary hover:bg-gray-medium/20 dark:hover:bg-primary/20",
        "border border-border dark:border-darkBorder hover:border-border/70 dark:hover:border-primary/50",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
      title={`Current: ${resolvedTheme}`}
      aria-label="Toggle theme"
    >
      {/* Sun Icon */}
      <SunIcon
        className={cn(
          "size-4.5 absolute transition-all duration-300 text-black",
          resolvedTheme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-0",
        )}
      />

      {/* Moon Icon */}
      <MoonIcon
        className={cn(
          "size-4 absolute transition-all duration-300",
          resolvedTheme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0",
        )}
      />
    </button>
  );
}
