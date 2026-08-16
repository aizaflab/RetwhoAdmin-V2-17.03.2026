"use client";

import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "@/components/icons/Icons";
import { useTheme } from "@/components/providers/ThemeProvider";

import { Button } from "./button/Button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const revealTheme = (nextTheme: "light" | "dark") => {
    if (typeof window === "undefined") {
      setTheme(nextTheme);
      return;
    }

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    doc.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  const cycleTheme = () => {
    if (resolvedTheme === "light") {
      revealTheme("dark");
    } else {
      revealTheme("light");
    }
  };

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="secondary"
      onClick={cycleTheme}
      title={`Current: ${resolvedTheme}`}
      aria-label="Toggle theme"
      className="size-8.5 rounded-lg"
    >
      {/* Sun Icon */}
      <SunIcon
        className={cn(
          "absolute size-4.5 text-black transition-all duration-300",
          resolvedTheme === "light"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 rotate-90 opacity-0",
        )}
      />

      {/* Moon Icon */}
      <MoonIcon
        className={cn(
          "absolute size-4.5 transition-all duration-300",
          resolvedTheme === "dark"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-90 opacity-0",
        )}
      />
    </Button>
  );
}
