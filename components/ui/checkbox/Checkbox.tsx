"use client";

import { forwardRef, useEffect, useRef, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { mergeRefs } from "@/lib/merge-refs";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";

export type CheckboxVariant =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";
export type CheckboxRadius = "none" | "xs" | "sm" | "md" | "lg" | "full";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size" | "color"
> {
  className?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  size?: "sm" | "md" | "lg";
  variant?: CheckboxVariant;
  color?: string;
  radius?: CheckboxRadius;
}

const boxSize = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

const markSize = {
  sm: "size-2.5",
  md: "size-3.5",
  lg: "size-4",
} as const;

// Per-variant classes: `on` is applied while marked, `hover` while unmarked.
const VARIANT: Record<CheckboxVariant, { on: string; hover: string }> = {
  primary: {
    on: "border-primary bg-primary text-white",
    hover: "hover:border-primary/50",
  },
  success: {
    on: "border-success bg-success text-white",
    hover: "hover:border-success/50",
  },
  warning: {
    on: "border-warning bg-warning text-black",
    hover: "hover:border-warning/60",
  },
  destructive: {
    on: "border-destructive bg-destructive text-destructive-foreground",
    hover: "hover:border-destructive/50",
  },
  info: {
    on: "border-info bg-info text-white",
    hover: "hover:border-info/50",
  },
} as const;

const RADIUS: Record<CheckboxRadius, string> = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      disabled = false,
      indeterminate = false,
      checked,
      defaultChecked = false,
      onCheckedChange,
      onChange,
      size = "md",
      variant = "primary",
      color,
      radius = "md",
      ...props
    },
    ref,
  ) => {
    const [isChecked, setChecked] = useControllableState({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });
    const innerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    // the box click.
    const toggle = (e?: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const next = !isChecked;

      setChecked(next);

      if (onChange) {
        if (e) {
          onChange(e);
        } else {
          onChange({
            target: {
              checked: next,
              name: props.name,
              id: props.id,
              type: "checkbox",
            },
          } as unknown as ChangeEvent<HTMLInputElement>);
        }
      }
    };

    const showMark = isChecked || indeterminate;

    return (
      <span className="relative inline-flex shrink-0">
        {/* Real input owns semantics, focus & form value; visually hidden. */}
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isChecked}
          disabled={disabled}
          onChange={toggle}
          ref={mergeRefs(ref, innerRef)}
          {...props}
        />

        <motion.div
          aria-hidden="true"
          onClick={() => {
            toggle();
            innerRef.current?.focus();
          }}
          whileTap={disabled ? undefined : { scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          style={
            showMark && color
              ? { backgroundColor: color, borderColor: color }
              : undefined
          }
          className={cn(
            "flex items-center justify-center border transition-colors",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            "peer-aria-invalid:border-red-500",
            boxSize[size],
            RADIUS[radius],
            showMark
              ? color
                ? "text-white"
                : VARIANT[variant].on
              : "border-input bg-background dark:border-primary dark:bg-transparent",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            !disabled &&
              !showMark &&
              (color ? "hover:border-foreground/40" : VARIANT[variant].hover),
            className,
          )}
        >
          {/* Indeterminate bar — mounts only while indeterminate. */}
          <AnimatePresence initial={false}>
            {indeterminate && (
              <motion.span
                key="indeterminate"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="h-0.5 w-2.5 rounded-full bg-current"
              />
            )}
          </AnimatePresence>

          {/* Check mark stays mounted and animates toward the current state —
              no mount/unmount race, so rapid toggling always settles right. */}
          {!indeterminate && (
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={markSize[size]}
              initial={false}
              animate={{
                scale: isChecked ? 1 : 0.4,
                opacity: isChecked ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <motion.path
                d="M4 12l5 5L20 6"
                initial={false}
                animate={{ pathLength: isChecked ? 1 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </motion.svg>
          )}
        </motion.div>
      </span>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
