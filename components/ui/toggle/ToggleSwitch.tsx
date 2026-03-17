"use client";

import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "@/components/icons/Icons";

export type ToggleSize = "sm" | "md" | "lg";
export type ToggleVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "neutral";
export type ToggleLabelPosition = "left" | "right" | "top";

export interface ToggleSwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  /** The controlled checked state of the toggle */
  checked?: boolean;
  /** The default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Callback when the checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** @deprecated Use onCheckedChange instead */
  onChange?: (checked: boolean) => void;
  /** The size of the toggle */
  size?: ToggleSize;
  /** The visual variant of the toggle */
  variant?: ToggleVariant;
  /** Label to display next to or above the toggle */
  label?: ReactNode;
  /** Helper text to display below the toggle */
  helperText?: ReactNode;
  /** Error message to display below the toggle (replaces helper text) */
  error?: ReactNode;
  /** Whether the toggle container should take up the full width */
  fullWidth?: boolean;
  /** Position of the label relative to the toggle */
  labelPosition?: ToggleLabelPosition;
  /** Optional icon to display inside the toggle thumb */
  thumbIcon?: string | ReactNode;
  /** Optional icon to display on the "on" side track */
  onIcon?: string | ReactNode;
  /** Optional icon to display on the "off" side track */
  offIcon?: string | ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Whether field is required (shows asterisk) */
  required?: boolean;
}

const ToggleSwitch = forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      onChange,
      disabled = false,
      loading = false,
      size = "md",
      variant = "primary",
      label,
      helperText,
      error,
      fullWidth = false,
      labelPosition = "right",
      thumbIcon,
      onIcon,
      offIcon,
      required,
      id,
      ...props
    },
    ref,
  ) => {
    // State for uncontrolled mode
    const [internalChecked, setInternalChecked] =
      React.useState<boolean>(defaultChecked);

    // Derived state
    const isChecked = checked !== undefined ? checked : internalChecked;

    const generatedId = React.useId();
    const toggleId = id || generatedId;
    const labelId = `${toggleId}-label`;
    const descriptionId = `${toggleId}-description`;
    const errorId = `${toggleId}-error`;

    const handleToggle = () => {
      // Prevent default to avoid double firing if inside a label
      // e.preventDefault();
      // Actually standard button type=button doesn't need preventDefault usually unless inside form submit

      if (disabled || loading) return;

      const newValue = !isChecked;

      // Update internal state if uncontrolled
      if (checked === undefined) {
        setInternalChecked(newValue);
      }

      // Trigger callbacks
      onCheckedChange?.(newValue);
      onChange?.(newValue);
    };

    // Size Configurations
    const sizeConfig = {
      sm: {
        switch: "w-8 h-4",
        thumb: "h-3 w-3",
        translate: "translate-x-4",
        icon: 10,
      },
      md: {
        switch: "w-11 h-6",
        thumb: "h-5 w-5",
        translate: "translate-x-5",
        icon: 14,
      },
      lg: {
        switch: "w-14 h-7",
        thumb: "h-6 w-6",
        translate: "translate-x-7",
        icon: 16,
      },
    };

    const currentSize = sizeConfig[size];

    // Variant Configurations
    const variantConfig = {
      primary: isChecked
        ? "bg-blue-600 dark:bg-blue-600 border-blue-600 dark:border-blue-600"
        : "bg-gray-200 dark:bg-gray-700 border-transparent",
      secondary: isChecked
        ? "bg-purple-600 dark:bg-purple-600 border-purple-600 dark:border-purple-600"
        : "bg-gray-200 dark:bg-gray-700 border-transparent",
      success: isChecked
        ? "bg-green-600 dark:bg-green-600 border-green-600 dark:border-green-600"
        : "bg-gray-200 dark:bg-gray-700 border-transparent",
      warning: isChecked
        ? "bg-amber-500 dark:bg-amber-500 border-amber-500 dark:border-amber-500"
        : "bg-gray-200 dark:bg-gray-700 border-transparent",
      destructive: isChecked
        ? "bg-red-600 dark:bg-red-600 border-red-600 dark:border-red-600"
        : "bg-gray-200 dark:bg-gray-700 border-transparent",
      neutral: isChecked
        ? "bg-gray-900 dark:bg-gray-700 border-gray-900 dark:border-gray-700"
        : "bg-gray-200 dark:bg-gray-700 border-transparent",
    };

    // Render Logic
    const renderIcon = (icon: string | ReactNode, wrapperClass = "") => {
      if (!icon) return null;
      return <div className={wrapperClass}>{icon}</div>;
    };

    return (
      <div
        className={cn(
          "inline-flex flex-col gap-1.5",
          fullWidth ? "w-full" : "w-auto",
          disabled && "opacity-60 cursor-not-allowed",
          className,
        )}
      >
        <div
          className={cn(
            "relative flex items-center min-h-fit",
            labelPosition === "left" && "flex-row gap-3", // Label is first in DOM, so flex-row keeps it on left
            labelPosition === "right" && "flex-row gap-3", // Button is middle, Label is last (rendered conditionally), so flex-row works
            labelPosition === "top" && "flex-col items-start gap-2",
          )}
        >
          {/* Label (Top or Side - Left) */}
          {label && (labelPosition === "top" || labelPosition === "left") && (
            <LabelContent
              label={label}
              required={required}
              id={labelId}
              toggleId={toggleId}
              onClick={() => !disabled && !loading && handleToggle()}
            />
          )}

          {/* Switch Button */}
          <button
            id={toggleId}
            type="button"
            role="switch"
            aria-checked={isChecked}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={
              error ? errorId : helperText ? descriptionId : undefined
            }
            disabled={disabled || loading}
            onClick={handleToggle}
            ref={ref}
            className={cn(
              "peer relative shrink-0 inline-flex items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
              currentSize.switch,
              variantConfig[variant],
              error && "ring-2 ring-red-500 ring-offset-1",
            )}
            {...props}
          >
            {/* Track Icons (Optional) */}
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-between px-1.5 opacity-100 transition-opacity duration-200",
                // Hide track icons if size is too small or not provided
                size === "sm" && "px-0.5",
              )}
            >
              {/* On Icon (Left side when checked) */}
              <span
                className={cn(
                  "flex items-center justify-center transition-opacity duration-200",
                  isChecked ? "opacity-100 delay-75" : "opacity-0",
                )}
              >
                {renderIcon(onIcon, "text-white dark:text-white")}
              </span>

              {/* Off Icon (Right side when unchecked) */}
              <span
                className={cn(
                  "flex items-center justify-center transition-opacity duration-200",
                  !isChecked ? "opacity-100 delay-75" : "opacity-0",
                )}
              >
                {renderIcon(offIcon, "text-gray-500 dark:text-gray-400")}
              </span>
            </span>

            {/* Thumb */}
            <span
              className={cn(
                "pointer-events-none flex items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                currentSize.thumb,
                isChecked ? currentSize.translate : "translate-x-0",
              )}
            >
              {loading ? (
                <Loader2Icon className="h-3 w-3 animate-spin" />
              ) : (
                thumbIcon &&
                renderIcon(
                  thumbIcon,
                  isChecked ? "text-primary" : "text-gray-400",
                )
              )}
            </span>
          </button>

          {/* Label (Right) */}
          {label && labelPosition === "right" && (
            <LabelContent
              label={label}
              required={required}
              id={labelId}
              toggleId={toggleId}
              onClick={() => !disabled && !loading && handleToggle()}
            />
          )}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <div
            id={error ? errorId : descriptionId}
            className={cn(
              "text-xs ml-0.5",
              error ? "text-red-500" : "text-gray-500 dark:text-gray-400",
            )}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  },
);

ToggleSwitch.displayName = "ToggleSwitch";

// Sub-component for Label to reduce duplication
const LabelContent = ({
  label,
  required,
  id,
  toggleId,
  onClick,
}: {
  label: ReactNode;
  required?: boolean;
  id: string;
  toggleId: string;
  onClick: () => void;
}) => (
  <label
    id={id}
    htmlFor={toggleId}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100 cursor-pointer select-none"
  >
    {label}
    {required && (
      <span className="text-red-500 ml-1" aria-hidden="true">
        *
      </span>
    )}
  </label>
);

// Simplify export to standard
export { ToggleSwitch };
// Keep alias for backward compatibility if we want, but since I'm editing the file, I should just export ToggleSwitch
// and update usages.
export { ToggleSwitch as DynamicToggle };
