"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type RadioVariant =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";
export type RadioSize = "sm" | "md" | "lg";
/** Shape of the control. `variant` picks the color, `appearance` the look. */
export type RadioAppearance = "dot" | "solid" | "outline" | "check" | "card";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (v: string) => void;
  size: RadioSize;
  variant: RadioVariant;
  appearance: RadioAppearance;
  disabled: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*                               DESIGN TOKENS                                */
/* -------------------------------------------------------------------------- */

interface VariantTokens {
  /** Border color while checked. */
  on: string;
  /** Colored mark — the `dot` fill. */
  dot: string;
  /** Colored surface — `solid`, `outline` and `check` fill the whole box. */
  fill: string;
  /** `solid` dot sitting on top of `fill`. */
  markBg: string;
  /** `check` stroke sitting on top of `fill`. */
  markText: string;
  /** Tinted card surface while checked. */
  card: string;
  hover: string;
}

const VARIANT: Record<RadioVariant, VariantTokens> = {
  primary: {
    on: "border-primary",
    dot: "bg-primary",
    fill: "border-primary bg-primary",
    markBg: "bg-primary-foreground",
    markText: "text-primary-foreground",
    card: "bg-primary/5",
    hover: "hover:border-primary/50",
  },
  success: {
    on: "border-success",
    dot: "bg-success",
    fill: "border-success bg-success",
    markBg: "bg-white",
    markText: "text-white",
    card: "bg-success/5",
    hover: "hover:border-success/50",
  },
  warning: {
    on: "border-warning",
    dot: "bg-warning",
    fill: "border-warning bg-warning",
    markBg: "bg-black",
    markText: "text-black",
    card: "bg-warning/5",
    hover: "hover:border-warning/60",
  },
  destructive: {
    on: "border-destructive",
    dot: "bg-destructive",
    fill: "border-destructive bg-destructive",
    markBg: "bg-destructive-foreground",
    markText: "text-destructive-foreground",
    card: "bg-destructive/5",
    hover: "hover:border-destructive/50",
  },
  info: {
    on: "border-info",
    dot: "bg-info",
    fill: "border-info bg-info",
    markBg: "bg-white",
    markText: "text-white",
    card: "bg-info/5",
    hover: "hover:border-info/50",
  },
};

const BOX: Record<RadioSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

const DOT: Record<RadioSize, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
};

/** `outline` punches a background-colored hole out of `fill`, leaving a ring. */
const HOLE: Record<RadioSize, string> = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
};

const CHECK: Record<RadioSize, string> = {
  sm: "size-2.5",
  md: "size-3",
  lg: "size-3.5",
};

/* -------------------------------------------------------------------------- */
/*                                RADIO GROUP                                 */
/* -------------------------------------------------------------------------- */

interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  size?: RadioSize;
  variant?: RadioVariant;
  appearance?: RadioAppearance;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      name,
      size = "md",
      variant = "primary",
      appearance = "dot",
      disabled = false,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    const autoName = useId();
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue);
    const current = isControlled ? value : internal;

    const setValue = (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    };

    return (
      <RadioGroupContext.Provider
        value={{
          name: name ?? autoName,
          value: current,
          setValue,
          size,
          variant,
          appearance,
          disabled,
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          className={cn(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
            className,
          )}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

/* -------------------------------------------------------------------------- */
/*                               RADIO GROUP ITEM                             */
/* -------------------------------------------------------------------------- */

interface RadioGroupItemProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value"
> {
  value: string;
  /** Optional inline label; renders a connected <label> for the input. */
  label?: string;
  description?: string;
}

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, label, description, disabled, id, ...props }, ref) => {
    const ctx = useContext(RadioGroupContext);
    if (!ctx) {
      throw new Error("<RadioGroupItem> must be used inside <RadioGroup>");
    }

    const autoId = useId();
    const inputId = id ?? autoId;
    const isChecked = ctx.value === value;
    const isDisabled = disabled || ctx.disabled;
    const v = VARIANT[ctx.variant];

    // `card` styles the surrounding surface; its control is a plain dot.
    const isCard = ctx.appearance === "card";
    const control = isCard ? "dot" : ctx.appearance;

    // `dot` keeps the box transparent and colors only the mark. The other three
    // flood the box and carve the mark out of it in the foreground color.
    const isFilled = control !== "dot";

    const spring = { type: "spring", stiffness: 500, damping: 25 } as const;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "group/radio inline-flex items-start gap-2.5",
          isCard &&
            cn(
              "rounded-lg border p-3 transition-colors",
              isChecked
                ? cn(v.on, v.card)
                : cn("border-input", !isDisabled && "hover:bg-muted/50"),
            ),
          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
      >
        <span className="relative inline-flex shrink-0">
          {/* Native radio keeps arrow-key roving + form semantics for free. */}
          <input
            ref={ref}
            type="radio"
            id={inputId}
            name={ctx.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => ctx.setValue(value)}
            className="peer sr-only"
            {...props}
          />

          <span
            aria-hidden="true"
            className={cn(
              "flex items-center justify-center rounded-full border transition-colors",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              BOX[ctx.size],
              isChecked
                ? isFilled
                  ? v.fill
                  : cn(v.on, "bg-background")
                : "border-input bg-background",
              !isDisabled && !isChecked && v.hover,
            )}
          >
            {control === "check" ? (
              <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                  scale: isChecked ? 1 : 0.4,
                  opacity: isChecked ? 1 : 0,
                }}
                transition={spring}
                className={cn(CHECK[ctx.size], v.markText)}
              >
                <motion.path
                  d="M4 12l5 5L20 6"
                  initial={false}
                  animate={{ pathLength: isChecked ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              </motion.svg>
            ) : (
              <motion.span
                initial={false}
                animate={{
                  scale: isChecked ? 1 : 0,
                  opacity: isChecked ? 1 : 0,
                }}
                transition={spring}
                className={cn(
                  "rounded-full",
                  control === "outline"
                    ? cn(HOLE[ctx.size], "bg-background")
                    : cn(DOT[ctx.size], control === "solid" ? v.markBg : v.dot),
                )}
              />
            )}
          </span>
        </span>

        {(label || description) && (
          <span className="grid gap-0.5 leading-none">
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs leading-snug text-muted-foreground">
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
