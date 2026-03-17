"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode, type ChangeEvent, useId } from "react";

export type RadioSize = "sm" | "md" | "lg";
export type RadioColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "neutral";
export type RadioVariant = "default" | "square" | "check";

interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> {
  name?: string;
  label?: ReactNode;
  error?: ReactNode;
  value?: string | number;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  className?: string;
  helperText?: ReactNode;
  onValueChange?: (value: string | number) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: RadioSize;
  color?: RadioColor;
  variant?: RadioVariant;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      name,
      label,
      error,
      value,
      checked,
      onChange,
      children,
      className,
      helperText,
      onValueChange,
      disabled = false,
      fullWidth = false,
      size = "md",
      color = "primary",
      variant = "default",
      id,
      ...props
    },
    ref,
  ) => {
    // Generate unique ID for accessibility if not provided
    const uniqueId = useId();
    const radioId = id || `radio-${uniqueId}`;
    const descriptionId = `${radioId}-description`;
    const errorId = `${radioId}-error`;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    // Styling maps
    const sizeMap = {
      sm: {
        container: "h-4 w-4",
        dot:
          variant === "check" || variant === "square"
            ? "h-3.5 w-3.5"
            : "size-2",
        text: "text-xs",
        labelGap: "ml-2",
      },
      md: {
        container: "h-5 w-5",
        dot:
          variant === "check" || variant === "square"
            ? "h-4.5 w-4.5"
            : "size-2.5",
        text: "text-sm",
        labelGap: "ml-3",
      },
      lg: {
        container: "h-6 w-6",
        dot:
          variant === "check" || variant === "square"
            ? "h-5.5 w-5.5"
            : "size-3",
        text: "text-base",
        labelGap: "ml-3.5",
      },
    };

    const colorMap = {
      primary: "border-primary text-primary focus:ring-primary",
      secondary: "border-secondary text-secondary focus:ring-secondary",
      success: "border-green-500 text-green-500 focus:ring-green-500",
      warning: "border-yellow-500 text-yellow-500 focus:ring-yellow-500",
      destructive: "border-destructive text-destructive focus:ring-destructive",
      neutral: "border-input text-foreground focus:ring-ring",
    };

    const currentSize = sizeMap[size];
    const currentColor = colorMap[color];

    return (
      <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
        <label
          className={cn(
            "flex items-start group",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <div className="flex items-center relative h-fit pt-0.5">
            <input
              id={radioId}
              type="radio"
              className="peer sr-only"
              checked={checked}
              disabled={disabled}
              value={value}
              name={name}
              onChange={handleChange}
              ref={ref}
              aria-describedby={
                error ? errorId : helperText ? descriptionId : undefined
              }
              {...props}
            />
            <div
              className={cn(
                "flex items-center justify-center border transition-all duration-200",
                "bg-background peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                currentSize.container,
                variant === "square" ? "rounded-md" : "rounded-full",
                checked
                  ? currentColor
                  : "border-input hover:border-muted-foreground/50",
                checked &&
                  variant !== "default" &&
                  (color === "neutral"
                    ? "bg-foreground border-foreground"
                    : "bg-current border-current"),
                disabled &&
                  "opacity-50 cursor-not-allowed bg-muted border-muted-foreground/30",
                error && "border-red-500 hover:border-red-600",
              )}
            >
              {variant === "default" && (
                <div
                  className={cn(
                    "rounded-full transition-transform duration-200 scale-0",
                    currentSize.dot,
                    checked && "scale-100",
                    checked
                      ? color === "neutral"
                        ? "bg-foreground"
                        : "bg-current"
                      : "bg-transparent",
                  )}
                />
              )}
              {variant === "square" && (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={cn(
                    "text-background transition-all duration-200 scale-0",
                    currentSize.dot,
                    checked && "scale-100",
                  )}
                >
                  <path d="m9.55 15.15l8.475-8.475q.3-.3.7-.3t.7.3t.3.713t-.3.712l-9.175 9.2q-.3.3-.7.3t-.7-.3L4.55 13q-.3-.3-.288-.712t.313-.713t.713-.3t.712.3z" />
                </svg>
              )}
              {variant === "check" && (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={cn(
                    "text-background transition-all duration-200 scale-0",
                    currentSize.dot,
                    checked && "scale-100",
                  )}
                >
                  <path d="m9.55 15.15l8.475-8.475q.3-.3.7-.3t.7.3t.3.713t-.3.712l-9.175 9.2q-.3.3-.7.3t-.7-.3L4.55 13q-.3-.3-.288-.712t.313-.713t.713-.3t.712.3z" />
                </svg>
              )}
            </div>
          </div>

          {(label || children) && (
            <div className={cn("flex flex-col", currentSize.labelGap)}>
              <span
                className={cn(
                  "font-medium leading-none select-none transition-opacity",
                  currentSize.text,
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "text-foreground",
                  error && "text-red-500",
                )}
              >
                {label || children}
              </span>

              {helperText && !error && (
                <p
                  id={descriptionId}
                  className={cn(
                    "text-muted-foreground mt-1.5",
                    size === "sm" ? "text-[10px]" : "text-xs",
                  )}
                >
                  {helperText}
                </p>
              )}

              {error && (
                <p
                  id={errorId}
                  className={cn(
                    "text-red-500 mt-0.5",
                    size === "sm" ? "text-[10px]" : "text-xs",
                  )}
                >
                  {error}
                </p>
              )}
            </div>
          )}
        </label>
      </div>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
