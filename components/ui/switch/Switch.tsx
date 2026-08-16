"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "@/components/icons/Icons";

export type SwitchVariant =
  | "primary"
  | "success"
  | "destructive"
  | "warning"
  | "secondary";
export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  variant?: SwitchVariant;
  size?: SwitchSize;
  showIcons?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

const SIZE: Record<SwitchSize, { track: string; thumb: string; icon: string }> =
  {
    sm: { track: "h-5 w-8 p-0.5", thumb: "size-4", icon: "size-2.5" },
    md: { track: "h-6 w-10 p-0.5", thumb: "size-5", icon: "size-3" },
    lg: { track: "h-7 w-12 p-1", thumb: "size-5", icon: "size-3.5" },
  };

const TRACK_VARIANT: Record<SwitchVariant, string> = {
  primary: "data-[state=checked]:bg-primary",
  success: "data-[state=checked]:bg-success",
  destructive: "data-[state=checked]:bg-destructive",
  warning: "data-[state=checked]:bg-warning",
  secondary: "data-[state=checked]:bg-secondary",
};

const THUMB_SPRING = { type: "spring", stiffness: 300, damping: 25 } as const;
const ICON_SPRING = { type: "spring", bounce: 0 } as const;

/**
 * Toggle switch — motion-driven, theme-token styled. The thumb slides via
 * flexbox (`justify-start` → `justify-end`) with a framer `layout` transition,
 * so the animation stays correct at any track size.
 */
const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      variant = "primary",
      size = "sm",
      showIcons = false,
      className,
      id,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const [isChecked, setChecked] = useControllableState({
      value: checked,
      defaultValue: defaultChecked ?? false,
      onChange: onCheckedChange,
    });
    const dims = SIZE[size];

    return (
      <motion.button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-label={ariaLabel}
        aria-checked={isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        data-state={isChecked ? "checked" : "unchecked"}
        initial={false}
        whileTap={disabled ? undefined : "tap"}
        onClick={() => {
          if (!disabled) setChecked(!isChecked);
        }}
        className={cn(
          "relative inline-flex items-center rounded-full bg-input",
          "transition-colors duration-200 ease-out",
          "justify-start data-[state=checked]:justify-end",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          dims.track,
          TRACK_VARIANT[variant],
          className,
        )}
      >
        {showIcons && (
          <>
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={
                isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
              }
              transition={ICON_SPRING}
              className={cn(
                "pointer-events-none absolute left-1 text-primary-foreground",
                dims.icon,
              )}
            >
              <CheckIcon className="h-full w-full" />
            </motion.span>
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={
                !isChecked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
              }
              transition={ICON_SPRING}
              className={cn(
                "pointer-events-none absolute right-1 text-muted-foreground",
                dims.icon,
              )}
            >
              <XIcon className="h-full w-full" />
            </motion.span>
          </>
        )}

        <motion.span
          layout
          transition={THUMB_SPRING}
          variants={{ tap: { scaleX: 1.25 } }}
          className={cn("rounded-full bg-white shadow-md", dims.thumb)}
        />
      </motion.button>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
