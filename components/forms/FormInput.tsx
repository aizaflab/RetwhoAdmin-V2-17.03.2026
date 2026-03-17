"use client";

import { forwardRef, InputHTMLAttributes, useId } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  helperText?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    { label, error, registration, helperText, className, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || registration?.name || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-zinc-300 dark:border-zinc-700",
            "bg-white dark:bg-zinc-900",
            "px-3 py-2 text-sm",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            error &&
              "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400",
            className,
          )}
          {...registration}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
