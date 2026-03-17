"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "./Checkbox";
import { useState, forwardRef } from "react";

interface CheckboxOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

interface CheckboxGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  label?: string;
  error?: string;
  onChange?: (e: { target: { value: (string | number | boolean)[] } }) => void;
  className?: string;
  helperText?: string;
  value?: (string | number | boolean)[];
  options?: CheckboxOption[];
  onValueChange?: (values: (string | number | boolean)[]) => void;
  defaultValue?: (string | number | boolean)[];
  fullWidth?: boolean;
  orientation?: "vertical" | "horizontal";
}

const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      label,
      error,
      onChange,
      className,
      helperText,
      value = [],
      options = [],
      onValueChange,
      defaultValue = [],
      fullWidth = false,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] = useState<
      (string | number | boolean)[]
    >(
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [],
    );

    // Sync with controlled value
    if (
      value !== undefined &&
      JSON.stringify(value) !== JSON.stringify(selectedValues)
    ) {
      setSelectedValues(Array.isArray(value) ? value : []);
    }

    const handleCheckboxChange = (
      optionValue: string | number | boolean,
      isChecked: boolean,
    ) => {
      let newSelectedValues: (string | number | boolean)[];
      if (isChecked) {
        newSelectedValues = [...selectedValues, optionValue];
      } else {
        newSelectedValues = selectedValues.filter((val) => val !== optionValue);
      }
      if (value === undefined) {
        setSelectedValues(newSelectedValues);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: newSelectedValues },
        };
        onChange(syntheticEvent);
      }
      if (onValueChange) {
        onValueChange(newSelectedValues);
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth && "w-full",
          className,
        )}
        ref={ref}
        {...props}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200 ">
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex gap-3 my-1",
            orientation === "vertical"
              ? "flex-col"
              : "flex-row flex-wrap gap-5",
          )}
        >
          {options.map((option) => (
            <Checkbox
              key={String(option.value)}
              checked={selectedValues.includes(option.value)}
              label={option.label}
              disabled={option.disabled}
              onValueChange={(isChecked) =>
                handleCheckboxChange(option.value, isChecked)
              }
              className="gap-1"
              size="sm"
            />
          ))}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-200 ">
            {helperText}
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

CheckboxGroup.displayName = "CheckboxGroup";

export { CheckboxGroup };
