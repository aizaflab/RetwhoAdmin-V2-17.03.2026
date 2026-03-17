"use client";

import { Controller, Control, FieldValues, Path } from "react-hook-form";
import SimpleSelect from "@/components/ui/select/SimpleSelect";
import { cn } from "@/lib/utils";

export interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
}

export default function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  error,
  options,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  helperText,
  className,
}: FormSelectProps<T>) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SimpleSelect
            value={field.value}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              error &&
                "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400",
              className,
            )}
          />
        )}
      />
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{helperText}</p>
      )}
    </div>
  );
}
