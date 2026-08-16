"use client";

import {
  ButtonHTMLAttributes,
  forwardRef,
  MouseEvent,
  ReactNode,
  useRef,
  useState,
} from "react";

import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "@/components/icons/Icons";

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

type Size =
  | "xs"
  | "sm"
  | "default"
  | "lg"
  | "xl"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-md"
  | "icon-lg";

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
      default: "bg-primary hover:bg-primary/90 border-transparent text-white",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
      outline: "border-border bg-transparent text-foreground hover:bg-muted",
      ghost: "hover:bg-muted text-foreground border-transparent",
      destructive:
        "bg-destructive text-white hover:bg-destructive/70 border-transparent",
      success: "bg-success text-white hover:bg-success/90 border-transparent",
      warning: "bg-warning text-black hover:bg-warning/90 border-transparent",
      info: "bg-info text-white hover:bg-info/90 border-transparent",
      light: "bg-muted text-foreground hover:bg-muted/80 border-border",
      dark: "bg-foreground text-background hover:opacity-90 border-transparent",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto border-transparent",
    };

    const sizeStyles: Record<Size, string> = {
      xs: "h-7 px-2.5 text-xs",
      sm: "h-8 px-3 text-xs",
      default: "h-9 px-4 py-2 text-sm",
      lg: "h-12 px-6",
      xl: "h-14 px-8 text-lg",
      icon: "size-[33px] p-0",
      "icon-xs": "size-7 p-0",
      "icon-sm": "h-8 w-8 p-0",
      "icon-md": "size-9 p-0",
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
        ref={mergeRefs(ref, buttonRef)}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex cursor-pointer items-center justify-center gap-2 border font-medium whitespace-nowrap transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
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
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: "inherit" }}
          >
            {rippleEffect.map((r) => (
              <span
                key={r.id}
                className="animate-ripple absolute rounded-full bg-white/30"
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

        {loading && (
          <>
            <LoaderIcon
              className={cn(
                "shrink-0 animate-spin",
                size === "sm" ? "size-3.5" : "size-4",
              )}
              aria-hidden="true"
            />
            <span className="sr-only">Loading...</span>
          </>
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
