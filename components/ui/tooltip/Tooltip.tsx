"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

// ── Types

export type TooltipSide = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";
export type TooltipSize = "sm" | "md" | "lg";
export type TooltipRadius = "none" | "sm" | "md" | "lg" | "full";
export type TooltipVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";
export type TooltipTriggerType = "hover" | "click" | "focus" | "contextMenu";

const VARIANT: Record<TooltipVariant, { bubble: string; arrow: string }> = {
  default: {
    bubble: "bg-muted text-popover-foreground border-border",
    arrow: "bg-muted border-border",
  },
  primary: {
    bubble: "bg-primary text-primary-foreground border-transparent",
    arrow: "bg-primary border-transparent",
  },
  success: {
    bubble: "bg-success text-white border-transparent",
    arrow: "bg-success border-transparent",
  },
  warning: {
    bubble: "bg-warning text-black border-transparent",
    arrow: "bg-warning border-transparent",
  },
  destructive: {
    bubble: "bg-destructive text-destructive-foreground border-transparent",
    arrow: "bg-destructive border-transparent",
  },
  info: {
    bubble: "bg-info text-white border-transparent",
    arrow: "bg-info border-transparent",
  },
};

const RADIUS: Record<TooltipRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const SIZE_CLASS: Record<TooltipSize, string> = {
  sm: "px-2 py-1 text-[11px]",
  md: "px-3 py-1.5 text-xs",
  lg: "px-4 py-2 text-sm",
};

/**
 * True when focus landed via the keyboard (`:focus-visible`). Lets a hover/focus
 * tooltip open on Tab-focus, while ignoring the programmatic focus a modal
 * restores to its opener when it closes — which would otherwise re-show the
 * tooltip after the user already dismissed it.
 */
function isKeyboardFocus(el: EventTarget | null): boolean {
  if (!(el instanceof Element) || typeof el.matches !== "function") return true;
  try {
    return el.matches(":focus-visible");
  } catch {
    // Older browsers without :focus-visible — keep the previous behavior.
    return true;
  }
}

const escHandlers = new Set<() => void>();

function onGlobalEscape(e: KeyboardEvent) {
  if (e.key === "Escape") [...escHandlers].forEach((h) => h());
}

function registerEscape(handler: () => void) {
  if (escHandlers.size === 0)
    document.addEventListener("keydown", onGlobalEscape);
  escHandlers.add(handler);
  return () => {
    escHandlers.delete(handler);
    if (escHandlers.size === 0)
      document.removeEventListener("keydown", onGlobalEscape);
  };
}

// ── Context

interface TooltipContextType {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  show: () => void;
  hide: () => void;
  trigger: TooltipTriggerType;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  color?: string;
  variant: TooltipVariant;
  showArrow: boolean;
  tooltipId: string;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Must be used within <Tooltip>");
  return ctx;
}

// ── Position math

const FLIP: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

// Extracted to module scope — no closure allocation on every scroll/resize event.
function computePosition(
  r: DOMRect,
  cW: number,
  cH: number,
  s: TooltipSide,
  align: TooltipAlign,
  offset: number,
): { top: number; left: number; ox: string; oy: string } {
  const top =
    s === "top"
      ? r.top - cH - offset
      : s === "bottom"
        ? r.bottom + offset
        : align === "start"
          ? r.top
          : align === "end"
            ? r.bottom - cH
            : r.top + (r.height - cH) / 2;

  const left =
    s === "left"
      ? r.left - cW - offset
      : s === "right"
        ? r.right + offset
        : align === "start"
          ? r.left
          : align === "end"
            ? r.right - cW
            : r.left + (r.width - cW) / 2;

  const ox =
    s === "left"
      ? "right"
      : s === "right"
        ? "left"
        : align === "start"
          ? "left"
          : align === "end"
            ? "right"
            : "50%";

  const oy = s === "top" ? "bottom" : s === "bottom" ? "top" : "50%";

  return { top, left, ox, oy };
}

function isOffScreen(
  c: { top: number; left: number },
  s: TooltipSide,
  cW: number,
  cH: number,
  vw: number,
  vh: number,
): boolean {
  return (
    (s === "top" && c.top < 0) ||
    (s === "bottom" && c.top + cH > vh) ||
    (s === "left" && c.left < 0) ||
    (s === "right" && c.left + cW > vw)
  );
}

function getCoords(
  r: DOMRect,
  cW: number,
  cH: number,
  side: TooltipSide,
  align: TooltipAlign,
  offset: number,
): {
  top: number;
  left: number;
  ox: string;
  oy: string;
  activeSide: TooltipSide;
} {
  const primary = computePosition(r, cW, cH, side, align, offset);
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const needsFlip = isOffScreen(primary, side, cW, cH, vw, vh);
  const activeSide = needsFlip ? FLIP[side] : side;
  const flipped = needsFlip
    ? computePosition(r, cW, cH, activeSide, align, offset)
    : primary;
  const { top, left, ox, oy } = isOffScreen(flipped, activeSide, cW, cH, vw, vh)
    ? primary
    : flipped;

  return {
    top: Math.max(4, Math.min(top, vh - cH - 4)),
    left: Math.max(4, Math.min(left, vw - cW - 4)),
    ox,
    oy,
    activeSide,
  };
}

// ── Tooltip

interface TooltipProps {
  children: ReactNode;
  delayDuration?: number;
  closeDelay?: number;
  trigger?: TooltipTriggerType;
  color?: string;
  variant?: TooltipVariant;
  showArrow?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Tooltip({
  children,
  delayDuration = 100,
  closeDelay = 0,
  trigger = "hover",
  color,
  variant = "default",
  showArrow = true,
  defaultOpen = false,
  open,
  onOpenChange,
}: TooltipProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internal;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tooltipId = useId();

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delayDuration);
  }, [delayDuration, setOpen]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    if (closeDelay > 0) {
      timerRef.current = setTimeout(() => setOpen(false), closeDelay);
    } else {
      setOpen(false);
    }
  }, [setOpen, closeDelay]);

  useEffect(() => {
    if (!isOpen) return;
    return registerEscape(() => setOpen(false));
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (!isOpen || (trigger !== "click" && trigger !== "contextMenu")) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !contentRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, trigger, setOpen, triggerRef, contentRef]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  const handleFocus = useCallback(
    (e: React.FocusEvent) => {
      // Only keyboard focus should open the tooltip. Skip the programmatic focus
      // a modal restores to its trigger on close, so the tooltip doesn't reopen
      // on its own after being dismissed.
      if (isKeyboardFocus(e.target)) show();
    },
    [show],
  );

  const handlers = {
    onMouseEnter: trigger === "hover" ? show : undefined,
    onMouseLeave: trigger === "hover" ? hide : undefined,
    onClick: trigger === "click" ? () => setOpen(!isOpen) : undefined,
    onFocus:
      trigger === "hover" || trigger === "focus" ? handleFocus : undefined,
    onBlur: trigger === "hover" || trigger === "focus" ? hide : undefined,
    onContextMenu:
      trigger === "contextMenu"
        ? (e: React.MouseEvent) => {
            e.preventDefault();
            setOpen(!isOpen);
          }
        : undefined,
  };

  const ctxValue = useMemo(
    () => ({
      isOpen,
      setOpen,
      show,
      hide,
      trigger,
      triggerRef,
      contentRef,
      color,
      variant,
      showArrow,
      tooltipId,
    }),
    [
      isOpen,
      setOpen,
      show,
      hide,
      trigger,
      color,
      variant,
      showArrow,
      tooltipId,
    ],
  );

  return (
    <TooltipContext.Provider value={ctxValue}>
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        className="inline-flex w-fit"
        aria-describedby={isOpen ? tooltipId : undefined}
        {...handlers}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

// ── TooltipTrigger

interface TooltipTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

function TooltipTrigger({ children }: TooltipTriggerProps) {
  return <>{children}</>;
}
TooltipTrigger.displayName = "TooltipTrigger";

// ── TooltipContent

const ENTER_OFFSET: Record<TooltipSide, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
};

const EXIT_OFFSET: Record<TooltipSide, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
};

const ARROW: Record<TooltipSide, { pos: string; border: string }> = {
  top: { pos: "bottom-[-4px]", border: "border-b border-r" },
  bottom: { pos: "top-[-4px]", border: "border-t border-l" },
  left: { pos: "right-[-4px]", border: "border-t border-r" },
  right: { pos: "left-[-4px]", border: "border-b border-l" },
};

interface TooltipContentProps extends Omit<HTMLMotionProps<"div">, "children"> {
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  radius?: TooltipRadius;
  size?: TooltipSize;
  interactive?: boolean;
  children?: React.ReactNode;
}

function TooltipContent({
  side = "top",
  align = "center",
  sideOffset = 8,
  radius = "sm",
  size = "md",
  interactive = false,
  children,
  className,
  style,
  ...props
}: TooltipContentProps) {
  const {
    isOpen,
    contentRef,
    triggerRef,
    color,
    variant,
    showArrow,
    tooltipId,
    show,
    hide,
    trigger,
  } = useTooltip();

  const hoverBridge =
    interactive && trigger === "hover"
      ? { onMouseEnter: show, onMouseLeave: hide }
      : undefined;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    ox: "50%",
    oy: "50%",
    activeSide: side,
    hidden: false,
    measured: false,
  });

  useLayoutEffect(() => {
    if (!mounted || !isOpen) {
      setPos((p) => (p.measured ? { ...p, measured: false } : p));
      return;
    }
    if (!triggerRef.current || !contentRef.current) return;

    let raf = 0;
    let retries = 0;
    const MAX_RETRIES = 8;

    const calc = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const tr = triggerRef.current;
        const ct = contentRef.current;
        if (!tr || !ct) return;
        if (!ct.offsetWidth) {
          if (retries < MAX_RETRIES) {
            retries++;
            calc();
          }
          return;
        }
        retries = 0;
        const r = tr.getBoundingClientRect();
        const hidden =
          r.bottom <= 0 ||
          r.top >= window.innerHeight ||
          r.right <= 0 ||
          r.left >= window.innerWidth;
        setPos({
          ...getCoords(
            r,
            ct.offsetWidth,
            ct.offsetHeight,
            side,
            align,
            sideOffset,
          ),
          hidden,
          measured: true,
        });
      });
    };

    calc();

    const onResize = () => calc();
    const onScroll = () => calc();

    const ro = new ResizeObserver(onResize);
    ro.observe(triggerRef.current);
    ro.observe(contentRef.current);
    for (
      let el = triggerRef.current.parentElement;
      el && el !== document.body;
      el = el.parentElement
    ) {
      ro.observe(el);
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [mounted, isOpen, side, align, sideOffset, triggerRef, contentRef]);

  const { activeSide } = pos;
  const isVert = activeSide === "top" || activeSide === "bottom";
  const arrowAlign =
    align === "center"
      ? isVert
        ? "left-1/2 -translate-x-1/2"
        : "top-1/2 -translate-y-1/2"
      : align === "start"
        ? isVert
          ? "left-4"
          : "top-3"
        : isVert
          ? "right-4"
          : "bottom-3";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={tooltipId}
          initial={{ opacity: 0, ...ENTER_OFFSET[side] }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
              default: {
                type: "spring",
                stiffness: 480,
                damping: 30,
                mass: 0.5,
              },
              opacity: {
                type: "tween",
                duration: 0.16,
                ease: [0.23, 1, 0.32, 1],
              },
            },
          }}
          exit={{
            opacity: 0,
            ...EXIT_OFFSET[activeSide],
            transition: {
              duration: 0.12,
              ease: [0.4, 0, 1, 1],
            },
          }}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            pointerEvents: interactive ? "auto" : "none",
            visibility: pos.hidden || !pos.measured ? "hidden" : "visible",
          }}
          {...hoverBridge}
        >
          <div style={{ position: "relative" }}>
            <div
              id={tooltipId}
              ref={contentRef}
              role="tooltip"
              style={{
                backgroundColor: color || undefined,
                ...(style as React.CSSProperties),
              }}
              className={cn(
                "max-w-xs border font-medium wrap-break-word shadow-md select-none",
                VARIANT[variant].bubble,
                RADIUS[radius],
                SIZE_CLASS[size],
                className,
              )}
              {...(props as React.HTMLAttributes<HTMLDivElement>)}
            >
              {children}
            </div>
            {showArrow && (
              <div
                className={cn(
                  "absolute h-2 w-2 rotate-45",
                  VARIANT[variant].arrow,
                  ARROW[activeSide].pos,
                  ARROW[activeSide].border,
                  arrowAlign,
                )}
                style={{
                  backgroundColor: color || undefined,
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface SimpleTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipSide;
  size?: TooltipSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  delayDuration?: number;
  contentClassName?: string;
  color?: string;
  trigger?: TooltipTriggerType;
  showArrow?: boolean;
  disabled?: boolean;
}

function SimpleTooltip({
  content,
  children,
  position = "top",
  size = "md",
  icon,
  iconPosition = "right",
  delayDuration = 100,
  contentClassName,
  color,
  trigger = "hover",
  showArrow = true,
  disabled = false,
}: SimpleTooltipProps) {
  const getSizeClasses = (): string => {
    const sizes: Record<TooltipSize, string> = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-3 text-base",
    };
    return sizes[size];
  };

  // Nothing to point at — render the trigger on its own rather than wiring up
  // listeners for a bubble that can never open.
  if (disabled) return <>{children}</>;

  return (
    <Tooltip
      delayDuration={delayDuration}
      color={color}
      trigger={trigger}
      showArrow={showArrow}
    >
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent
        side={position}
        className={cn(getSizeClasses(), contentClassName)}
      >
        <div className="flex items-center gap-2">
          {icon && iconPosition === "left" && (
            <span className="inline-block shrink-0">{icon}</span>
          )}
          <span className="font-medium">{content}</span>
          {icon && iconPosition === "right" && (
            <span className="inline-block shrink-0">{icon}</span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export {
  SimpleTooltip,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};
