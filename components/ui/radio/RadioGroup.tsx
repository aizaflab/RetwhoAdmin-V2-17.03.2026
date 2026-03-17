"use client";

import { useState, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Radio } from "./Radio";

interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: ReactNode;
}

interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  label?: string;
  error?: string;
  name?: string;
  onChange?: (e: { target: { name?: string; value: string | number } }) => void;
  className?: string;
  value?: string | number;
  helperText?: string;
  options?: RadioOption[];
  onValueChange?: (value: string | number) => void;
  defaultValue?: string | number;
  fullWidth?: boolean;
  orientation?: "vertical" | "horizontal";
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      label,
      error,
      name,
      onChange,
      className,
      value = "",
      helperText,
      options = [],
      onValueChange,
      defaultValue = "",
      fullWidth = false,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    const [selectedValue, setSelectedValue] = useState<string | number>(
      value || defaultValue || "",
    );

    // Sync with controlled value
    if (value !== undefined && value !== selectedValue) {
      setSelectedValue(value);
    }

    const handleRadioChange = (radioValue: string | number) => {
      if (value === undefined) {
        setSelectedValue(radioValue);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { name, value: radioValue },
        };
        onChange(syntheticEvent);
      }

      if (onValueChange) {
        onValueChange(radioValue);
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200 dark:font-normal ">
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex gap-3 my-1",
            orientation === "vertical" ? "flex-col" : "flex-wrap",
          )}
          role="radiogroup"
        >
          {options.map((option) => (
            <Radio
              key={String(option.value)}
              checked={selectedValue === option.value}
              value={option.value}
              name={name}
              label={option.label}
              disabled={option.disabled}
              onValueChange={handleRadioChange}
            >
              {option.icon && (
                <div className="flex items-center ">
                  {option.icon}
                  <span className="ml-2 ">{option.label}</span>
                </div>
              )}
            </Radio>
          ))}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500  ">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };
