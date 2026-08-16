"use client";

import type React from "react";
import { forwardRef, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Supported input types — text-like controls only. */
export type InputType =
  | "text"
  | "number"
  | "email"
  | "url"
  | "password"
  | "tel";

interface InputProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** One of the supported text-like input types. */
  type?: InputType;
  /** Convenience callback that receives the raw string value. */
  onValueChange?: (value: string) => void;
  /** Decorative element rendered inside the field, before the text. */
  startIcon?: ReactNode;
  /** Decorative element rendered inside the field, after the text. */
  endIcon?: ReactNode;
}

/**
 * Pure input *control* — labels, descriptions and errors are composed with the
 * Field primitives. Set `aria-invalid` (e.g. from `<Field>`) to surface the
 * error styling.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      onValueChange,
      onChange,
      onFocus,
      onBlur,
      onPointerDown,
      startIcon,
      endIcon,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    // Stop the mouse wheel from silently changing a focused number input.
    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number") (e.target as HTMLInputElement).blur();
    };

    // The focus ring is an accessibility affordance for keyboard users. Browsers
    // match `:focus-visible` on text inputs even for mouse clicks, so we track
    // the focus origin ourselves: a pointer press right before focus means the
    // focus came from the mouse — show only the border, no ring.
    const pointerFocus = useRef(false);
    const [keyboardFocus, setKeyboardFocus] = useState(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
      pointerFocus.current = true;
      onPointerDown?.(e);
    };
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setKeyboardFocus(!pointerFocus.current);
      pointerFocus.current = false;
      onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setKeyboardFocus(false);
      onBlur?.(e);
    };

    const input = (
      <input
        type={type}
        data-slot="input"
        data-focus-visible={keyboardFocus ? "true" : undefined}
        ref={ref}
        onChange={handleChange}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "flex h-10 w-full min-w-0 rounded-md border border-border bg-background px-3 py-1 text-sm transition-[color,box-shadow] outline-none",
          "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
          "focus:border-primary/50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-ring/10",
          "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          startIcon && "pl-9",
          endIcon && "pr-9",
          className,
        )}
        {...props}
      />
    );

    if (!startIcon && !endIcon) return input;

    return (
      <div className="relative flex w-full items-center text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
        {startIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center">
            {startIcon}
          </span>
        )}
        {input}
        {endIcon && (
          <span className="absolute right-3 flex items-center">{endIcon}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
