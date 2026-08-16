"use client";

import type React from "react";
import { createContext, useContext } from "react";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
} from "@/components/icons/Icons";

import { Button } from "../button/Button";

/**
 * Composable, themeable pagination (shadcn-style + variants).
 *
 *   <Pagination variant="pill" size="lg">
 *     <PaginationContent>
 *       <PaginationItem><PaginationPrevious onClick={prev} disabled={…} /></PaginationItem>
 *       <PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem>
 *       <PaginationItem><PaginationEllipsis /></PaginationItem>
 *       <PaginationItem><PaginationNext onClick={next} disabled={…} /></PaginationItem>
 *     </PaginationContent>
 *   </Pagination>
 *
 * `variant`/`size` are set once on <Pagination> and flow to every child via
 * context — no prop-drilling, full composability.
 */

type PaginationVariant = "default" | "outline" | "ghost" | "pill" | "floating";
type PaginationSize = "sm" | "default" | "medium" | "lg";

interface PaginationCtx {
  variant: PaginationVariant;
  size: PaginationSize;
  /** Raw CSS color for the active page (and active-aware variants). */
  color?: string;
  /** Text color on top of `color`. Override when `color` is light. */
  colorForeground?: string;
}

const PaginationContext = createContext<PaginationCtx>({
  variant: "default",
  size: "default",
});

const usePagination = () => useContext(PaginationContext);

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];
type ButtonSize = React.ComponentProps<typeof Button>["size"];
type ButtonRounded = React.ComponentProps<typeof Button>["rounded"];

// Per-size token map → square page links, wide prev/next, ellipsis box.
const SIZE_MAP: Record<
  PaginationSize,
  { link: ButtonSize; control: ButtonSize; controlHeight: string; box: string }
> = {
  sm: { link: "icon-xs", control: "xs", controlHeight: "h-7", box: "size-7" },
  default: {
    link: "icon",
    control: "default",
    controlHeight: "h-[33px]",
    box: "size-9",
  },
  medium: {
    link: "icon-md",
    control: "default",
    controlHeight: "h-9",
    box: "size-9",
  },
  lg: { link: "icon-lg", control: "lg", controlHeight: "h-12", box: "size-12" },
};

/**
 * Per-variant resolver → the Button props + extra classes for one page link.
 *
 * Borders and fills come from Button's own `variant` (its own classes, so no
 * tailwind-merge conflicts). `className` only carries additive, non-conflicting
 * utilities. The active page is always a solid `default` fill; the variants
 * differ in how the *inactive* pages look.
 */
function resolveVariant(
  variant: PaginationVariant,
  isActive: boolean,
): { variant: ButtonVariant; rounded: ButtonRounded; className: string } {
  const active = "font-semibold";

  switch (variant) {
    // Every page sits in a bordered box; the active page is filled.
    case "outline":
      return isActive
        ? { variant: "default", rounded: "default", className: active }
        : {
            variant: "outline",
            rounded: "default",
            className: "hover:bg-primary/5 hover:text-primary",
          };
    // Inactive pages carry a faint tint; the active page is filled.
    case "ghost":
      return isActive
        ? { variant: "default", rounded: "default", className: active }
        : {
            variant: "ghost",
            rounded: "default",
            className: "bg-primary/5 hover:bg-primary/10",
          };
    case "pill":
      return isActive
        ? { variant: "default", rounded: "full", className: active }
        : { variant: "ghost", rounded: "full", className: "" };
    case "floating":
      return isActive
        ? { variant: "default", rounded: "full", className: active }
        : { variant: "ghost", rounded: "full", className: "" };
    default:
      return isActive
        ? { variant: "default", rounded: "default", className: active }
        : { variant: "ghost", rounded: "default", className: "" };
  }
}

/** Landmark wrapper — sets the variant/size context for all children. */
function Pagination({
  className,
  variant = "default",
  size = "default",
  color,
  colorForeground = "#fff",
  ...props
}: React.ComponentProps<"nav"> & {
  variant?: PaginationVariant;
  size?: PaginationSize;
  color?: string;
  colorForeground?: string;
}) {
  return (
    <PaginationContext.Provider
      value={{ variant, size, color, colorForeground }}
    >
      <nav
        aria-label="pagination"
        data-slot="pagination"
        data-variant={variant}
        data-size={size}
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
      />
    </PaginationContext.Provider>
  );
}

/** The horizontal list; gains a card shell in the `floating` variant. */
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  const { variant } = usePagination();
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        "flex flex-row items-center",
        variant === "pill" ? "gap-1.5" : "gap-1",
        variant === "floating" &&
          "rounded-full border border-border bg-card p-1 py-0.5 shadow-md",
        className,
      )}
      {...props}
    />
  );
}

/** A single list item — wrap each link/ellipsis in one. */
function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  /** Override the context size for this one control. */
  size?: ButtonSize;
} & Omit<React.ComponentProps<typeof Button>, "size" | "variant">;

/** A clickable page button. Mark the current page with `isActive`. */
function PaginationLink({
  className,
  isActive = false,
  size,
  style,
  ...props
}: PaginationLinkProps) {
  const ctx = usePagination();
  const styles = resolveVariant(ctx.variant, isActive);

  // A custom `color` paints the active page as a solid fill in that color;
  // an inline style always wins over Button's variant classes.
  const colorActive = Boolean(ctx.color && isActive);
  const colorStyle: React.CSSProperties | undefined = colorActive
    ? {
        backgroundColor: ctx.color,
        borderColor: ctx.color,
        color: ctx.colorForeground,
      }
    : undefined;

  return (
    <Button
      type="button"
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      variant={styles.variant}
      rounded={styles.rounded}
      size={size ?? SIZE_MAP[ctx.size].link}
      style={{ ...colorStyle, ...style }}
      className={cn("font-medium", styles.className, className)}
      {...props}
    />
  );
}

/** Previous-page control — icon plus a label that hides on small screens. */
function PaginationPrevious({
  className,
  label = "Previous",
  ...props
}: PaginationLinkProps & { label?: string }) {
  const { size } = usePagination();
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size={label ? SIZE_MAP[size].control : SIZE_MAP[size].link}
      className={cn(
        label && `gap-1 px-2.5 ${SIZE_MAP[size].controlHeight}`,
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      {label && <span className="hidden sm:block">{label}</span>}
    </PaginationLink>
  );
}

/** Next-page control — label that hides on small screens plus an icon. */
function PaginationNext({
  className,
  label = "Next",
  ...props
}: PaginationLinkProps & { label?: string }) {
  const { size } = usePagination();
  return (
    <PaginationLink
      aria-label="Go to next page"
      size={label ? SIZE_MAP[size].control : SIZE_MAP[size].link}
      className={cn(
        label && `gap-1 px-2.5 ${SIZE_MAP[size].controlHeight}`,
        className,
      )}
      {...props}
    >
      {label && <span className="hidden sm:block">{label}</span>}
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}

/** A non-interactive gap marker for skipped pages. */
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { size } = usePagination();
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "flex items-center justify-center text-muted-foreground",
        SIZE_MAP[size].box,
        className,
      )}
      {...props}
    >
      {/* Hide the glyph, not the span: `aria-hidden` on the parent would bury
          the sr-only text with it, and screen readers would skip the gap. */}
      <EllipsisIcon aria-hidden="true" className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

/** Stacked chevrons — there is no double-chevron glyph in the icon set. */
function DoubleChevron({ dir }: { dir: "left" | "right" }) {
  const Icon = dir === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <span aria-hidden="true" className="flex items-center">
      <Icon className="size-4" />
      <Icon className="-ml-2.5 size-4" />
    </span>
  );
}

/** Jump to the first page. Pass `label` to show text beside the chevrons. */
function PaginationFirst({
  className,
  label,
  ...props
}: PaginationLinkProps & { label?: string }) {
  const { size } = usePagination();
  return (
    <PaginationLink
      aria-label="Go to first page"
      size={label ? SIZE_MAP[size].control : SIZE_MAP[size].link}
      className={cn(label && "gap-1 px-2.5", className)}
      {...props}
    >
      <DoubleChevron dir="left" />
      {label && <span>{label}</span>}
    </PaginationLink>
  );
}

/** Jump to the last page. Pass `label` to show text beside the chevrons. */
function PaginationLast({
  className,
  label,
  ...props
}: PaginationLinkProps & { label?: string }) {
  const { size } = usePagination();
  return (
    <PaginationLink
      aria-label="Go to last page"
      size={label ? SIZE_MAP[size].control : SIZE_MAP[size].link}
      className={cn(label && "gap-1 px-2.5", className)}
      {...props}
    >
      {label && <span>{label}</span>}
      <DoubleChevron dir="right" />
    </PaginationLink>
  );
}

type PageItem = number | "left-ellipsis" | "right-ellipsis";

/** Inclusive integer range, `from`…`to`. */
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Build the list of page tokens to render, inserting ellipsis markers where
 * pages are skipped. Returns page numbers plus "left"/"right" ellipsis tokens.
 *
 * Every branch emits exactly `siblings * 2 + 5` items once the page count
 * exceeds that budget — near an edge the window grows inward to spend the slot
 * the missing ellipsis freed up. A varying item count would make the whole bar
 * change width as the user pages through, which reads as a layout glitch.
 */
function getPageItems(
  current: number,
  total: number,
  siblings = 1,
): PageItem[] {
  // first + last + current + 2*siblings + 2 ellipses
  const totalSlots = siblings * 2 + 5;
  if (total <= totalSlots) return range(1, total);

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  // An ellipsis only earns its slot when it hides more than one page — with a
  // single page hidden, showing the page itself costs the same width.
  const showLeft = leftSibling > 2;
  const showRight = rightSibling < total - 1;

  // Pages shown on the side that has no ellipsis.
  const edgeCount = siblings * 2 + 3;

  if (!showLeft && showRight) {
    return [...range(1, edgeCount), "right-ellipsis", total];
  }

  if (showLeft && !showRight) {
    return [1, "left-ellipsis", ...range(total - edgeCount + 1, total)];
  }

  return [
    1,
    "left-ellipsis",
    ...range(leftSibling, rightSibling),
    "right-ellipsis",
    total,
  ];
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  getPageItems,
  type PaginationVariant,
  type PaginationSize,
  type PageItem,
};
