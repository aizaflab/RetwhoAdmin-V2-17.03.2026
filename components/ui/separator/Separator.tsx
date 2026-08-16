"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "solid" | "dashed" | "dotted" | "gradient";
export type SeparatorSize = "sm" | "md" | "lg";
export type SeparatorLabelPosition = "start" | "center" | "end";

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation;
  variant?: SeparatorVariant;
  /** Line thickness — 1px, 2px, 4px. */
  size?: SeparatorSize;
  /**
   * Purely visual separators (inside menus, toolbars…) should stay decorative;
   * set to false to expose a semantic `separator` role to assistive tech.
   */
  decorative?: boolean;
  /** Optional label — horizontal orientation only. */
  label?: ReactNode;
  labelPosition?: SeparatorLabelPosition;
}

/* -------------------------------------------------------------------------- */
/*                               DESIGN TOKENS                                */
/* -------------------------------------------------------------------------- */

const STROKE: Record<SeparatorVariant, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
  gradient: "", // painted with a background, not a border
};

/** Border width, per orientation. */
const BORDER: Record<SeparatorOrientation, Record<SeparatorSize, string>> = {
  horizontal: { sm: "border-t", md: "border-t-2", lg: "border-t-4" },
  vertical: { sm: "border-l", md: "border-l-2", lg: "border-l-4" },
};

/** Gradient has no border, so its thickness is its own box size. */
const THICKNESS: Record<SeparatorOrientation, Record<SeparatorSize, string>> = {
  horizontal: { sm: "h-px", md: "h-0.5", lg: "h-1" },
  vertical: { sm: "w-px", md: "w-0.5", lg: "w-1" },
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      variant = "solid",
      size = "sm",
      decorative = true,
      label,
      labelPosition = "center",
      ...props
    },
    ref,
  ) => {
    const semantics = decorative
      ? { role: "none" as const }
      : {
          role: "separator" as const,
          "aria-orientation": orientation,
        };

    const isGradient = variant === "gradient";

    /**
     * One stretch of line. `fade` says which end should melt into the
     * background — only meaningful for the gradient variant, where a labelled
     * separator wants each half fading away from the label.
     */
    const line = (fade: "both" | "start" | "end") => {
      if (isGradient) {
        const direction =
          orientation === "horizontal"
            ? "bg-gradient-to-r"
            : "bg-gradient-to-b";
        const stops =
          fade === "both"
            ? "from-transparent via-border to-transparent"
            : fade === "start"
              ? "from-transparent to-border"
              : "from-border to-transparent";

        return cn(
          THICKNESS[orientation][size],
          direction,
          stops,
          orientation === "horizontal" ? "w-full" : "min-h-4 self-stretch",
        );
      }

      return cn(
        "border-border",
        STROKE[variant],
        BORDER[orientation][size],
        orientation === "horizontal" ? "w-full" : "h-full min-h-4 self-stretch",
      );
    };

    if (label && orientation === "horizontal") {
      // `start` puts the label first, `end` puts it last, `center` splits the
      // line in two. Only the drawn halves get flex-1.
      const showBefore = labelPosition !== "start";
      const showAfter = labelPosition !== "end";

      return (
        <div
          ref={ref}
          {...semantics}
          className={cn("flex w-full items-center gap-3", className)}
          {...props}
        >
          {showBefore && (
            <span
              className={cn("flex-1", line(isGradient ? "start" : "both"))}
            />
          )}
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {label}
          </span>
          {showAfter && (
            <span className={cn("flex-1", line(isGradient ? "end" : "both"))} />
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        {...semantics}
        className={cn("shrink-0", line("both"), className)}
        {...props}
      />
    );
  },
);

Separator.displayName = "Separator";

export { Separator };
