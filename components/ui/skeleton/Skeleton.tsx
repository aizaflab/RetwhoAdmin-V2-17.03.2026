"use client";

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SkeletonShape = "rect" | "text" | "circle";
export type SkeletonAnimation = "pulse" | "shimmer" | "none";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
  animation?: SkeletonAnimation;
  /** Number of stacked text lines (text shape only). Last line is shortened. */
  lines?: number;
}

/** Shared surface colour for every skeleton primitive. */
const BASE = "bg-muted dark:bg-secondary";

const SHAPE: Record<SkeletonShape, string> = {
  rect: "rounded-md",
  text: "h-4 rounded",
  circle: "rounded-full",
};

const ANIMATION: Record<SkeletonAnimation, string> = {
  // Respect users who ask for reduced motion — freeze on a static surface.
  pulse: "animate-pulse motion-reduce:animate-none",
  // Shimmer sweep — a soft highlight band driven across the element by the
  // `skeleton-shimmer` keyframes (see globals.css). A wide, low-opacity
  // gradient keeps the colour ramp gentle; `linear` timing sweeps at an even
  // pace instead of easing (which reads as a pause) at the edges.
  shimmer:
    "relative overflow-hidden after:absolute after:inset-0 after:animate-[skeleton-shimmer_1.8s_linear_infinite] after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent dark:after:via-foreground/[0.14] motion-reduce:after:hidden",
  none: "",
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, shape = "rect", animation = "pulse", lines, ...props },
    ref,
  ) => {
    // Loading placeholders are noise for screen readers — hide them and let
    // the consumer announce loading state on the region (aria-busy).
    if (shape === "text" && lines && lines > 1) {
      return (
        <div
          ref={ref}
          aria-hidden="true"
          className={cn("flex w-full flex-col gap-2", className)}
          {...props}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                BASE,
                SHAPE.text,
                ANIMATION[animation],
                // Shorten the last line so the block reads like real prose.
                i === lines - 1 ? "w-3/5" : "w-full",
              )}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          BASE,
          shape === "circle" && "aspect-square",
          SHAPE[shape],
          ANIMATION[animation],
          className,
        )}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
