"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { useState, forwardRef, type ReactNode, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onValueChange?: (value: string) => void;
  requiredSign?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      onValueChange,
      onChange,
      value,
      defaultValue,
      requiredSign = false,
      required = false,
      disabled = false,
      id,
      ...props
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState<string>(
      (value as string) || (defaultValue as string) || "",
    );

    const uniqueId = useId();
    const inputId =
      id ||
      `input-${label?.replace(/\s+/g, "-").toLowerCase() || "anon"}-${uniqueId}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(e);
      onValueChange?.(newValue);
    };

    // Prevent mouse wheel from changing number input value
    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number") {
        (e.target as HTMLInputElement).blur();
      }
    };

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium dark:font-[350] text-gray-700 dark:text-gray-100 cursor-pointer"
          >
            {label}
            {requiredSign && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-300">
              <span className="pointer-events-auto">{startIcon}</span>
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-11 w-full rounded-md border border-border dark:border-[#424242] dark:font-[350] bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 text-black dark:text-white",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && "border-red-500 ",
              disabled && "bg-gray-100 dark:bg-[#474747] cursor-not-allowed",
              className,
            )}
            value={inputValue}
            onChange={handleChange}
            onWheel={handleWheel}
            min={type === "number" ? 0 : undefined}
            ref={ref}
            required={required}
            disabled={disabled}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-300">
              <span className="pointer-events-auto">{endIcon}</span>
            </div>
          )}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-300">
            {helperText}
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
