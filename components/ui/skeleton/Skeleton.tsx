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
  pulse: "animate-pulse motion-reduce:animate-none",
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
