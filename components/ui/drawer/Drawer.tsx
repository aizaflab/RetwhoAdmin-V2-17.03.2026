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

const ANIM_MS = 300; // MUST match the Tailwind duration-300 below.

/** Never-changing store — only the server/client snapshot split is used. */
const subscribeNever = () => () => {};

export type DrawerSide = "right" | "left";
export type DrawerSize = "sm" | "md" | "lg" | "xl";

export interface DrawerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  open?: boolean;
  onClose?: () => void;
  side?: DrawerSide;
  size?: DrawerSize;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  zIndex?: number;
  overlayClassName?: string;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

/** A slide-in panel anchored to a screen edge. Same portal + enter/exit
 *  lifecycle as Dialog, but it translates in from the side instead of scaling. */
const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    className,
    children,
    open = false,
    onClose,
    side = "right",
    size = "md",
    closeOnBackdropClick = true,
    closeOnEsc = true,
    showCloseButton = true,
    title,
    description,
    footer,
    zIndex = 3000,
    overlayClassName,
    ...props
  },
  ref,
) {
  // Portals need the DOM. `useSyncExternalStore` reports client-vs-server
  // without a mount effect, so the first client render is already correct.
  const isClient = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  // `entered` drives the slide-in; `exiting` keeps the panel mounted while the
  // slide-out plays. Both are set from a frame/timeout callback rather than an
  // effect body, so neither triggers a cascading render.
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

  const panelRef = useRef<HTMLDivElement | null>(null);

  // Flip to the "in" styles on the next frame so the transition has a start value.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Unmount once the slide-out has finished.
  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => setExiting(false), ANIM_MS);
    return () => clearTimeout(t);
  }, [exiting]);

  // Lock background scroll while visible (keeps the scrollbar, so no shift).
  useScrollLock(isVisible);

  // ESC to close.
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  if (!isClient || !isVisible) return null;

  const hidden = side === "right" ? "translate-x-full" : "-translate-x-full";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
        side === "right" ? "justify-end" : "justify-start",
        animIn ? "opacity-100" : "opacity-0",
        overlayClassName,
      )}
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget && closeOnBackdropClick) onClose?.();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "relative flex h-full w-full flex-col bg-card text-card-foreground shadow-2xl transition-transform duration-300 ease-in-out focus:outline-none",
          sizeClasses[size],
          animIn ? "translate-x-0" : hidden,
          className,
        )}
        tabIndex={-1}
        {...props}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-[17px] font-medium tracking-tight text-card-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs leading-2.5 text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="-mr-1 shrink-0"
                onClick={onClose}
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        <div
          data-scroll-lock-scroller
          className="min-h-0 flex-1 overflow-auto overscroll-contain px-5 py-4"
        >
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
});

Drawer.displayName = "Drawer";
export { Drawer };
