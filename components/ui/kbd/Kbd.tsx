"use client";

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type KbdSize = "sm" | "md" | "lg";

/** default = raised keycap · outline = flat border · solid = high-contrast · ghost = borderless */
export type KbdVariant = "default" | "outline" | "solid" | "ghost";

interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: KbdSize;
  variant?: KbdVariant;
}

/* -------------------------------------------------------------------------- */
/*                               DESIGN TOKENS                                */
/* -------------------------------------------------------------------------- */

const SIZE: Record<KbdSize, string> = {
  sm: "h-5 min-w-5 px-1 text-2xs gap-0.5",
  md: "h-6 min-w-6 px-1.5 text-xs gap-1",
  lg: "h-7 min-w-7 px-2 text-sm gap-1",
};

const VARIANT: Record<KbdVariant, string> = {
  // Raised keycap — subtle darker bottom edge reads as key depth.
  default:
    "border border-border bg-muted text-muted-foreground shadow-[inset_0_-1.5px_0_0] shadow-border/60",
  outline: "border border-border bg-transparent text-foreground",
  // High-contrast key (inverts on light/dark automatically).
  solid:
    "border border-transparent bg-foreground text-background shadow-[inset_0_-1.5px_0_0] shadow-black/20",
  ghost: "border border-transparent bg-transparent text-muted-foreground",
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

/** A single keyboard key. Compose several inside `KbdGroup` for a shortcut. */
const Kbd = forwardRef<HTMLElement, KbdProps>(
  (
    { className, size = "md", variant = "default", children, ...props },
    ref,
  ) => (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap select-none",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  ),
);

Kbd.displayName = "Kbd";

/* -------------------------------------------------------------------------- */

/** Lays out several `Kbd` keys (with optional separators) as one shortcut. */
const KbdGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);

KbdGroup.displayName = "KbdGroup";

export { Kbd, KbdGroup };
