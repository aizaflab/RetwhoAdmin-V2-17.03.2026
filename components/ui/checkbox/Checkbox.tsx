"use client";

import { useState, forwardRef, type ReactNode, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/icons/Icons";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> {
  className?: string;
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (checked: boolean) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  size?: "sm" | "md" | "lg";
  border?: string;
  children?: ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      disabled = false,
      indeterminate = false,
      checked,
      defaultChecked = false,
      onValueChange,
      onChange,
      id,
      size = "md",
      border,
      children,
      ...props
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = useState<boolean>(
      checked !== undefined ? checked : defaultChecked,
    );

    // Sync checked state from props
    if (checked !== undefined && isChecked !== checked) {
      setIsChecked(checked);
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      if (checked === undefined) {
        setIsChecked(newChecked);
      }

      // Call both callbacks if provided
      if (onChange) {
        onChange(e);
      }

      if (onValueChange) {
        onValueChange(newChecked);
      }
    };

    return (
      <div className={cn("flex", fullWidth && "w-full", className)}>
        <div className="flex items-start">
          <div
            className={cn(
              "flex items-center h-5",
              helperText && !error && "mt-[3px]",
              error && "mt-[3px]",
            )}
          >
            <input
              type="checkbox"
              className="sr-only"
              id={id}
              checked={isChecked}
              disabled={disabled}
              onChange={handleChange}
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                "flex items-center justify-center size-[1.15rem] border rounded transition-colors cursor-pointer",
                size === "sm" && "size-4",
                size === "lg" && "size-6",
                size === "md" && "size-5",
                isChecked || indeterminate
                  ? "bg-primary border-primary text-white"
                  : `bg-background dark:bg-transparent dark:border-primary ${border ? border : "border-input"} `,
                disabled && "opacity-50 cursor-not-allowed",
                error && "border-red-500",
                !disabled && !isChecked && "hover:border-primary/50",
              )}
              onClick={() => {
                if (!disabled) {
                  const newChecked = !isChecked;

                  if (checked === undefined) {
                    setIsChecked(newChecked);
                  }

                  if (onChange) {
                    const event = new Event("change", { bubbles: true });
                    Object.defineProperty(event, "target", {
                      writable: false,
                      value: {
                        checked: newChecked,
                        name: props.name,
                        id: id,
                        type: "checkbox",
                        value: newChecked,
                      },
                    });
                    onChange(event as unknown as ChangeEvent<HTMLInputElement>);
                  }

                  if (onValueChange) {
                    onValueChange(newChecked);
                  }
                }
              }}
            >
              {isChecked && !indeterminate && (
                <CheckIcon
                  className={cn(
                    "w-3.5 h-3.5 text-primary-foreground",
                    size === "sm" && "w-2.5 h-2.5",
                    size === "md" && "w-3.5 h-3.5",
                    size === "lg" && "w-4 h-4",
                  )}
                />
              )}
              {indeterminate && (
                <div className="w-2.5 h-0.5 bg-primary-foreground rounded-full" />
              )}
            </div>
          </div>

          {(label || children) && (
            <div className="ml-2.5 text-sm">
              <label
                className={cn(
                  "font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none",
                  disabled && "opacity-50 cursor-not-allowed",
                  size === "sm" && "text-sm",
                )}
                onClick={() => {
                  if (!disabled) {
                    const newChecked = !isChecked;

                    if (checked === undefined) {
                      setIsChecked(newChecked);
                    }

                    if (onChange) {
                      const event = new Event("change", { bubbles: true });
                      Object.defineProperty(event, "target", {
                        writable: false,
                        value: { checked: newChecked },
                      });
                      onChange(
                        event as unknown as ChangeEvent<HTMLInputElement>,
                      );
                    }

                    if (onValueChange) {
                      onValueChange(newChecked);
                    }
                  }
                }}
              >
                {label || children}
              </label>

              {helperText && !error && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {helperText}
                </p>
              )}

              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
