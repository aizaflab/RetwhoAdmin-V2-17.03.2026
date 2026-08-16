"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { XIcon } from "@/components/icons/Icons";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning"
  | "info";

/** solid = filled, soft = tinted background, outline = border only */
export type BadgeAppearance = "solid" | "soft" | "outline";

export type BadgeSize = "sm" | "md" | "lg";

export type BadgeRounded = "sm" | "md" | "lg" | "full";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  rounded?: BadgeRounded;
  /** Leading status dot in the variant color. */
  dot?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Renders a remove button and calls back on click. */
  onRemove?: () => void;
  /** Accessible label for the remove button; defaults to the badge text. */
  removeLabel?: string;
}

/* -------------------------------------------------------------------------- */
/*                               DESIGN TOKENS                                */
/* -------------------------------------------------------------------------- */

const SOLID: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground border-transparent",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  outline: "bg-transparent text-foreground border-border",
  destructive: "bg-destructive text-destructive-foreground border-transparent",
  // success/info/warning have no *-foreground token yet; white/black are
  // theme-safe on these saturated fills. Swap for tokens if they get added.
  success: "bg-success text-white border-transparent",
  warning: "bg-warning text-black border-transparent",
  info: "bg-info text-white border-transparent",
};

const SOFT: Record<BadgeVariant, string> = {
  default: "bg-primary/12 text-primary border-transparent",
  secondary: "bg-muted text-muted-foreground border-transparent",
  outline: "bg-muted/60 text-foreground border-transparent",
  destructive: "bg-destructive/12 text-destructive border-transparent",
  success: "bg-success/12 text-success border-transparent",
  warning: "bg-warning/15 text-warning border-transparent",
  info: "bg-info/12 text-info border-transparent",
};

const OUTLINE: Record<BadgeVariant, string> = {
  default: "bg-transparent text-primary border-primary/40",
  secondary: "bg-transparent text-muted-foreground border-border",
  outline: "bg-transparent text-foreground border-border",
  destructive: "bg-transparent text-destructive border-destructive/40",
  success: "bg-transparent text-success border-success/40",
  warning: "bg-transparent text-warning border-warning/50",
  info: "bg-transparent text-info border-info/40",
};

const DOT: Record<BadgeVariant, string> = {
  default: "bg-primary",
  secondary: "bg-muted-foreground",
  outline: "bg-foreground",
  destructive: "bg-destructive",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
};

const SIZE: Record<BadgeSize, string> = {
  sm: "h-5 px-2 text-2xs gap-1",
  md: "h-6 px-2.5 text-xs gap-1.5",
  lg: "h-7 px-3 text-sm gap-1.5",
};

const ROUNDED: Record<BadgeRounded, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      children,
      variant = "default",
      appearance = "solid",
      size = "md",
      rounded = "full",
      dot = false,
      startIcon,
      endIcon,
      onRemove,
      removeLabel,
      ...props
    },
    ref,
  ) => {
    const appearanceStyles =
      appearance === "solid" ? SOLID : appearance === "soft" ? SOFT : OUTLINE;

    const resolvedRemoveLabel =
      removeLabel ??
      (typeof children === "string" ? `Remove ${children}` : "Remove");

    return (
      // AnimatePresence is intentionally NOT here — it must wrap the *list* in
      // the consumer so a removed badge stays mounted long enough to play exit.
      <motion.span
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="inline-flex"
      >
        <span
          ref={ref}
          className={cn(
            "inline-flex items-center border font-medium whitespace-nowrap select-none",
            appearanceStyles[variant],
            SIZE[size],
            ROUNDED[rounded],
            className,
          )}
          {...props}
        >
          {dot && (
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                // Solid appearance sits on a colored fill — keep the dot readable.
                appearance === "solid" ? "bg-current opacity-80" : DOT[variant],
              )}
            />
          )}

          {startIcon && (
            <span aria-hidden="true" className="inline-flex shrink-0">
              {startIcon}
            </span>
          )}

          {children}

          {endIcon && (
            <span aria-hidden="true" className="inline-flex shrink-0">
              {endIcon}
            </span>
          )}

          {onRemove && (
            <button
              type="button"
              aria-label={resolvedRemoveLabel}
              onClick={(e) => {
                // Don't let the X trigger a clickable badge/parent handler.
                e.stopPropagation();
                onRemove();
              }}
              className={cn(
                "-mr-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full",
                "opacity-60 transition-opacity hover:opacity-100",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              <XIcon className={size === "sm" ? "size-3" : "size-3.5"} />
            </button>
          )}
        </span>
      </motion.span>
    );
  },
);

Badge.displayName = "Badge";

export { Badge };
