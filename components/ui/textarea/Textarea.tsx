"use client";

import { cn } from "@/lib/utils";
import { Loader2Icon, CircleXIcon } from "@/components/icons/Icons";
import {
  useState,
  forwardRef,
  useRef,
  type ReactNode,
  type ChangeEvent,
  type TextareaHTMLAttributes,
  useEffect,
  useCallback,
  useImperativeHandle,
  useId,
} from "react";

export type TextareaSize = "sm" | "md" | "lg";
export type TextareaVariant = "default" | "filled" | "outline" | "ghost";

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onValueChange?: (value: string) => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  requiredSign?: boolean;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  maxLength?: number;
  showCount?: boolean;
  clearable?: boolean;
  loading?: boolean;
  size?: TextareaSize;
  variant?: TextareaVariant;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
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
      minRows = 3,
      maxRows = 10,
      autoResize = false,
      maxLength,
      showCount = false,
      clearable = false,
      loading = false,
      size = "md",
      variant = "default",
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    // State for controlled/uncontrolled value
    const [internalValue, setInternalValue] = useState<string>(
      (value as string) || (defaultValue as string) || "",
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value as string) : internalValue;
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    // Combine refs
    useImperativeHandle(ref, () => innerRef.current!);

    // Unique IDs for accessibility
    const uniqueId = useId();
    const inputId = id || `textarea-${uniqueId}`;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;

    // Auto-resize logic
    const adjustHeight = useCallback(() => {
      const element = innerRef.current;
      if (!element || !autoResize) return;

      element.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 20;
      const minHeight =
        minRows * lineHeight + (size === "sm" ? 12 : size === "md" ? 18 : 24); // approx padding
      const maxHeight =
        maxRows * lineHeight + (size === "sm" ? 12 : size === "md" ? 18 : 24);

      const newHeight = Math.max(
        minHeight,
        Math.min(element.scrollHeight, maxHeight),
      );
      element.style.height = `${newHeight}px`;
    }, [autoResize, minRows, maxRows, size]);

    // Effect to adjust height controlled value changes
    useEffect(() => {
      adjustHeight();
    }, [currentValue, adjustHeight]);

    // Handle change
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(e);
      onValueChange?.(newValue);
    };

    // Handle clear
    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
      }
      onValueChange?.("");
      if (innerRef.current) {
        innerRef.current.value = "";
        innerRef.current.focus();
      }
    };

    // Styles
    const sizeClasses = {
      sm: "px-2.5 py-1.5 text-xs min-h-[60px]",
      md: "px-3 py-2 text-sm min-h-[80px]",
      lg: "px-4 py-3 text-base min-h-[100px]",
    };

    const variantClasses = {
      default: "border-input bg-background ring-offset-background",
      filled:
        "border-transparent bg-muted/50 hover:bg-muted/70 focus:bg-background focus:border-primary",
      outline:
        "border-2 border-input bg-transparent hover:border-accent-foreground/20 focus:border-primary",
      ghost:
        "border-transparent bg-transparent hover:bg-muted/50 focus:bg-background shadow-none",
    };

    // Character count
    const charCount = currentValue.length;
    const isOverLimit = maxLength && charCount > maxLength;

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth ? "w-full" : "w-auto",
          className,
        )}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error ? "text-red-500" : "text-foreground",
            )}
          >
            {label}
            {(required || requiredSign) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}

        <div className="relative group">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none z-10 font-bold">
              {startIcon}
            </div>
          )}

          {/* Textarea */}
          <textarea
            id={inputId}
            ref={innerRef}
            className={cn(
              "flex w-full rounded-md border text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
              sizeClasses[size],
              variantClasses[variant],
              startIcon && "pl-9",
              (endIcon || clearable || loading) && "pr-9",
              error && "border-red-500 focus-visible:ring-red-500",
              !autoResize && "resize-y",
              autoResize && "resize-none overflow-hidden",
            )}
            value={currentValue}
            onChange={handleChange}
            maxLength={maxLength}
            disabled={disabled || loading}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? descriptionId : undefined
            }
            rows={minRows}
            {...props}
          />

          {/* End Actions (Icon / Clear / Loading) */}
          <div className="absolute right-3 top-3 flex items-center gap-2 text-muted-foreground">
            {loading ? (
              <Loader2Icon className="animate-spin h-4 w-4 text-gray-400" />
            ) : clearable && currentValue && !disabled ? (
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-foreground transition-colors focus:outline-none"
                aria-label="Clear text"
              >
                <CircleXIcon className="h-4 w-4" />
              </button>
            ) : endIcon ? (
              <div className="pointer-events-none">{endIcon}</div>
            ) : null}
          </div>
        </div>

        {/* Footer: Helper Text / Error + Counter */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {error ? (
              <p
                id={errorId}
                className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5"
              >
                {error}
              </p>
            ) : helperText ? (
              <p id={descriptionId} className="text-xs text-gray-500 mt-0.5">
                {helperText}
              </p>
            ) : null}
          </div>

          {showCount && (
            <p
              className={cn(
                "text-xs text-gray-500 tabular-nums whitespace-nowrap mt-0.5",
                isOverLimit && "text-red-500 font-medium",
              )}
            >
              {charCount} {maxLength && `/ ${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
