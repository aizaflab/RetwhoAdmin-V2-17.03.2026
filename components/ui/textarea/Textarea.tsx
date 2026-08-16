"use client";

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type PointerEvent,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type TextareaVariant = "default" | "filled" | "ghost";
export type TextareaSize = "sm" | "md" | "lg";
export type TextareaResize = "none" | "vertical" | "auto";

interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  variant?: TextareaVariant;
  size?: TextareaSize;
  /** `auto` grows with content (up to maxRows). */
  resize?: TextareaResize;
  maxRows?: number;
  /** Character counter — requires `maxLength`. */
  showCount?: boolean;
  invalid?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               DESIGN TOKENS                                */
/* -------------------------------------------------------------------------- */

const VARIANT: Record<TextareaVariant, string> = {
  default: "border-border bg-background",
  filled: "border-transparent bg-muted focus:bg-background",
  ghost: "border-transparent bg-transparent hover:bg-muted/60",
};

const SIZE: Record<TextareaSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

const RESIZE: Record<TextareaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  auto: "resize-none overflow-hidden",
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      resize = "vertical",
      maxRows = 10,
      rows = 3,
      showCount = false,
      invalid = false,
      maxLength,
      onChange,
      onFocus,
      onBlur,
      onPointerDown,
      defaultValue,
      value,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const [count, setCount] = useState(
      String(value ?? defaultValue ?? "").length,
    );

    // Match Input: the focus ring is a keyboard affordance. A pointer press
    // right before focus means the focus came from the mouse — show only the
    // border, no ring.
    const pointerFocus = useRef(false);
    const [keyboardFocus, setKeyboardFocus] = useState(false);

    const handlePointerDown = (e: PointerEvent<HTMLTextAreaElement>) => {
      pointerFocus.current = true;
      onPointerDown?.(e);
    };
    const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
      setKeyboardFocus(!pointerFocus.current);
      pointerFocus.current = false;
      onFocus?.(e);
    };
    const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
      setKeyboardFocus(false);
      onBlur?.(e);
    };

    const setRefs = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const autoGrow = useCallback(
      (el: HTMLTextAreaElement) => {
        if (resize !== "auto") return;
        el.style.height = "auto";
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
        const max = lineHeight * maxRows;
        el.style.height = `${Math.min(el.scrollHeight, max)}px`;
        el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
      },
      [resize, maxRows],
    );

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      autoGrow(e.target);
      if (showCount) setCount(e.target.value.length);
      onChange?.(e);
    };

    const counter = showCount && maxLength !== undefined;

    return (
      <div className={cn("relative w-full", counter && "pb-1")}>
        <textarea
          ref={setRefs}
          rows={rows}
          maxLength={maxLength}
          data-focus-visible={keyboardFocus ? "true" : undefined}
          aria-invalid={invalid || undefined}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          defaultValue={defaultValue}
          value={value}
          className={cn(
            "flex w-full min-w-0 rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
            "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
            "focus:border-primary/50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-ring/10",
            "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            VARIANT[variant],
            SIZE[size],
            RESIZE[resize],
            className,
          )}
          {...props}
        />

        {counter && (
          <span
            aria-live="polite"
            className={cn(
              "pointer-events-none absolute right-1 -bottom-4 font-mono text-2xs tabular-nums",
              count >= (maxLength ?? Infinity)
                ? "text-destructive"
                : "text-muted-foreground/70",
            )}
          >
            {count}/{maxLength}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
