"use client";

import { LoaderIcon } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";
import React, {
  forwardRef,
  useState,
  useRef,
  MouseEvent,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

// ---------- Types ----------
type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "link";

type Size = "sm" | "default" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg";

type Rounded = "none" | "sm" | "default" | "lg" | "xl" | "full";

type Elevation = "none" | "sm" | "default" | "md" | "lg" | "xl";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loadingText?: string;
  ripple?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: Size;
  elevation?: Elevation;
  rounded?: Rounded;
  variant?: Variant;
}

// ---------- Component ----------
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      endIcon,
      onClick,
      children,
      className,
      startIcon,
      loadingText,
      ripple = true,
      type = "button",
      loading = false,
      disabled = false,
      size = "default",
      fullWidth = false,
      elevation = "none",
      rounded = "default",
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [rippleEffect, setRippleEffect] = useState<Ripple[]>([]);

    // Handle ripple effect
    const handleRipple = (e: MouseEvent<HTMLButtonElement>) => {
      if (!ripple || disabled || loading) return;
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const rippleId = Date.now();

      setRippleEffect((prev) => [...prev, { id: rippleId, x, y, size }]);

      setTimeout(() => {
        setRippleEffect((prev) => prev.filter((r) => r.id !== rippleId));
      }, 600);
    };

    // Handle click with ripple
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      handleRipple(e);
      onClick?.(e);
    };

    // ---------- Styles ----------
    const variantStyles: Record<Variant, string> = {
      default:
        "bg-primary text-white border border-primary hover:bg-primary/90 hover:border-primary/90 focus-visible:bg-primary/95 focus-visible:border-primary/95 dark:bg-[#07659B] dark:text-white dark:border-primary/80 dark:hover:bg-primary/80 dark:hover:border-primary/70 dark:focus-visible:bg-primary/80",
      secondary:
        "bg-secondary text-black border border-border hover:bg-secondary/80 focus-visible:bg-secondary/80 dark:text-white dark:border-darkBorder dark:focus-visible:bg-secondary/80",
      outline:
        "border border-border bg-white text-black hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] dark:border-darkBorder dark:bg-darkPrimary dark:text-white dark:hover:bg-secondary/80 dark:focus-visible:bg-secondary/80",
      ghost:
        "text-black hover:bg-secondary focus-visible:bg-secondary border-transparent dark:text-white dark:hover:text-white dark:focus-visible:bg-secondary/80",
      destructive:
        "bg-destructive text-white hover:bg-destructive/90 focus-visible:bg-destructive/90 border-transparent",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:bg-green-700 border-transparent",
      warning:
        "bg-amber-500 text-white hover:bg-amber-600 focus-visible:bg-amber-600 border-transparent",
      info: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:bg-blue-600 border-transparent",
      light:
        "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:bg-gray-200 border-gray-200",
      dark: "bg-gray-800 text-white hover:bg-gray-900 focus-visible:bg-gray-900 border-transparent",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto border-transparent",
    };

    const sizeStyles: Record<Size, string> = {
      sm: "h-8 px-3 text-xs",
      default: "h-9 px-4 py-2 text-sm",
      lg: "h-12 px-6",
      xl: "h-14 px-8 text-lg",
      icon: "size-[33px] p-0",
      "icon-sm": "h-8 w-8 p-0",
      "icon-lg": "h-12 w-12 p-0",
    };

    const roundedStyles: Record<Rounded, string> = {
      none: "rounded-none",
      sm: "rounded-sm",
      default: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    };

    const elevationStyles: Record<Elevation, string> = {
      none: "",
      sm: "shadow-sm shadow-black/10 dark:shadow-black/30",
      default: "shadow shadow-black/10 dark:shadow-black/30",
      md: "shadow-md shadow-black/20 dark:shadow-black/40",
      lg: "shadow-lg shadow-black/25 dark:shadow-black/50",
      xl: "shadow-xl shadow-black/30 dark:shadow-black/60",
    };

    // ---------- Render ----------
    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
              node;
          }
        }}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 whitespace-nowrap border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-darkLight/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-darkBg disabled:pointer-events-none disabled:opacity-50 cursor-pointer ",
          variantStyles[variant],
          sizeStyles[size],
          roundedStyles[rounded],
          elevationStyles[elevation],
          fullWidth && "w-full",
          variant !== "link" && "active:translate-y-0.5 active:duration-75",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect */}
        {ripple && (
          <span
            className="absolute inset-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
            style={{ borderRadius: "inherit" }}
          >
            {rippleEffect.map((r) => (
              <span
                key={r.id}
                className={cn(
                  "absolute rounded-full animate-ripple",
                  variant === "default" ||
                    variant === "destructive" ||
                    variant === "success" ||
                    variant === "warning" ||
                    variant === "info" ||
                    variant === "dark"
                    ? "bg-white/20"
                    : "bg-black/10 dark:bg-white/20",
                )}
                style={{
                  width: `${r.size}px`,
                  height: `${r.size}px`,
                  left: `${r.x}px`,
                  top: `${r.y}px`,
                }}
              />
            ))}
          </span>
        )}

        {/* Loading spinner */}
        {loading && (
          <LoaderIcon
            className={cn(
              "animate-spin",
              size === "sm" ? "h-3 w-3" : "h-4 w-4",
            )}
            aria-hidden="true"
          />
        )}

        {/* Start icon */}
        {!loading && startIcon && (
          <span className="inline-flex shrink-0">{startIcon}</span>
        )}

        {/* Button text */}
        {loading && loadingText ? loadingText : children}

        {/* End icon */}
        {!loading && endIcon && (
          <span className="inline-flex shrink-0">{endIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
