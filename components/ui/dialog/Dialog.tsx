"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";
import { XIcon } from "@/components/icons/Icons";

import { Button } from "../button/Button";

const ANIM_MS = 200; // MUST match your Tailwind duration-200

/** Never-changing store — only the server/client snapshot split is used. */
const subscribeNever = () => () => {};

export type DialogSize =
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "xxlarge"
  | "full";

export type DialogVariant = "default" | "destructive" | "warning" | "success";

export interface DialogProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Controlled open state. */
  open?: boolean;
  onClose?: () => void;
  size?: DialogSize;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  initialFocus?: React.RefObject<HTMLElement | null>;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: DialogVariant;
  zIndex?: number;
  overlayClassName?: string;
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    className,
    children,
    open = false, // controlled
    onClose,
    size = "medium",
    closeOnBackdropClick = true,
    closeOnEsc = true,
    showCloseButton = true,
    preventScroll = true,
    initialFocus,
    title,
    description,
    footer,
    variant = "default",
    zIndex = 3000,
    overlayClassName,
    ...props
  },
  ref,
) {
  // Portals need the DOM. `useSyncExternalStore` reports client-vs-server
  // without a mount effect, so the first client render is already correct and
  // hydration still matches the (empty) server output.
  const isClient = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  // `entered` drives the enter transition; `exiting` keeps the dialog mounted
  // while the exit transition plays. Both are set from a frame/timeout callback
  // rather than an effect body, so neither triggers a cascading render.
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);

  // React to the `open` flip during render — the documented way to adjust state
  // from props without an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setExiting(false);
    else {
      setExiting(true);
      setEntered(false);
    }
  }

  const isVisible = open || exiting;
  const animIn = open && entered;

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Flip to the "in" styles on the next frame so the transition has a start value.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Unmount once the exit transition has finished.
  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => setExiting(false), ANIM_MS);
    return () => clearTimeout(t);
  }, [exiting]);

  // Global scroll lock while visible (keeps the scrollbar, so no layout shift).
  useScrollLock(isVisible && preventScroll);

  // Focus management
  useEffect(() => {
    if (isVisible) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const t = setTimeout(() => {
        if (initialFocus && initialFocus.current) {
          initialFocus.current.focus();
        } else if (dialogRef.current) {
          dialogRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(t);
    } else if (previousActiveElement.current) {
      const t = setTimeout(() => {
        if (
          previousActiveElement.current &&
          previousActiveElement.current.focus
        ) {
          previousActiveElement.current.focus();
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isVisible, initialFocus]);

  // ESC to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose?.();
    }
  };

  const handleTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dialogRef.current) return;
    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusableElements.length) return;

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstEl) {
      lastEl.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      firstEl.focus();
      e.preventDefault();
    }
  };

  const sizeClasses: Record<DialogSize, string> = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
    xlarge: "max-w-xl",
    xxlarge: "max-w-2xl",
    full: "max-w-full mx-4",
  };

  const variantClasses: Record<DialogVariant, string> = {
    default: "bg-card text-card-foreground border border-border",
    destructive: "bg-card text-card-foreground border border-border",
    warning: "bg-card text-card-foreground border border-border",
    success: "bg-card text-card-foreground border border-border",
  };

  // Render while visible (open OR playing exit animation)
  if (!isClient || !isVisible) return null;

  return createPortal(
    <div
      data-portal-dialog="true"
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-200 ease-in-out focus:outline-none",
        animIn ? "opacity-100" : "opacity-0",
        overlayClassName,
      )}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "dialog-title" : undefined}
      aria-describedby={description ? "dialog-description" : undefined}
    >
      <div
        ref={(node) => {
          dialogRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "relative flex max-h-[calc(100vh-2rem)] w-full transform flex-col rounded-xl shadow-xl transition-all duration-200 ease-in-out focus:outline-none",
          animIn ? "scale-100 opacity-100" : "scale-95 opacity-0",
          sizeClasses[size] || sizeClasses.medium,
          variantClasses[variant] || variantClasses.default,
          className,
        )}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Tab") handleTabKey(e);
        }}
        {...props}
      >
        {showCloseButton && (
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-2 right-2 sm:top-4 sm:right-4"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        )}

        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-6">
          {title && (
            <div className="mb-4 shrink-0">
              <h2
                id="dialog-title"
                className="text-lg mb-1 leading-none font-medium tracking-tight text-card-foreground"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="dialog-description"
                  className="text-xs text-muted-foreground/80"
                >
                  {description}
                </p>
              )}
            </div>
          )}

          <div
            data-dialog-scrollable
            data-scroll-lock-scroller
            className={cn(
              !title ? "mt-0" : "mt-2",
              // pr-1 keeps content off the scrollbar when it overflows/scrolls.
              "min-h-0 flex-1 overflow-auto overscroll-contain pr-1 text-card-foreground",
              "flex flex-col",
            )}
          >
            {children}
          </div>

          {footer && <div className="mt-6 shrink-0">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
});

Dialog.displayName = "Dialog";
export { Dialog };
