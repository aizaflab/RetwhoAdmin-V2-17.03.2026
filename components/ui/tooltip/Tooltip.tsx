"use client";

import React, {
  useState,
  useRef,
  useLayoutEffect,
  createContext,
  useContext,
  ReactNode,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type TooltipPosition =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left"
  | "leftTop"
  | "leftBottom"
  | "right"
  | "rightTop"
  | "rightBottom";

type TooltipSize = "sm" | "md" | "lg";
type TooltipTriggerType = "hover" | "click" | "focus" | "contextMenu";

interface TooltipCoords {
  top: number;
  left: number;
  originX: string;
  originY: string;
}

interface TooltipContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  position: TooltipPosition;
  trigger: TooltipTriggerType;
  delayDuration: number;
  color?: string;
  showArrow: boolean;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within <Tooltip>");
  }
  return context;
}

interface TooltipProps {
  children: ReactNode;
  position?: TooltipPosition;
  delayDuration?: number;
  trigger?: TooltipTriggerType;
  color?: string;
  showArrow?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Tooltip({
  children,
  position = "top",
  delayDuration = 100,
  trigger = "hover",
  color,
  showArrow = true,
  defaultOpen = false,
  onOpenChange,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleOpen = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      onOpenChange?.(true);
    }, delayDuration);
  }, [delayDuration, onOpenChange]);

  const handleClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const eventHandlers = {
    onMouseEnter: trigger === "hover" ? handleOpen : undefined,
    onMouseLeave: trigger === "hover" ? handleClose : undefined,
    onClick: trigger === "click" ? () => setIsOpen((prev) => !prev) : undefined,
    onFocus: trigger === "focus" ? handleOpen : undefined,
    onBlur: trigger === "focus" ? handleClose : undefined,
    onContextMenu:
      trigger === "contextMenu"
        ? (e: React.MouseEvent) => {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        : undefined,
  };

  return (
    <TooltipContext.Provider
      value={{
        isOpen,
        setIsOpen,
        triggerRef,
        contentRef,
        position,
        trigger,
        delayDuration,
        color,
        showArrow,
      }}
    >
      <div className="relative inline-flex w-fit" {...eventHandlers}>
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}
const TooltipTrigger = forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    const { triggerRef } = useTooltip();

    const handleRefChange = useCallback(
      (element: HTMLDivElement | null) => {
        triggerRef.current = element;
        if (typeof forwardedRef === "function") {
          forwardedRef(element);
        } else if (forwardedRef) {
          forwardedRef.current = element;
        }
      },
      [triggerRef, forwardedRef],
    );

    return (
      <div
        ref={handleRefChange}
        className={cn("cursor-help", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}

function TooltipContent(props: TooltipContentProps) {
  const { isOpen } = useTooltip();
  if (!isOpen) return null;
  return <TooltipContentInternal {...props} />;
}

function TooltipContentInternal({
  children,
  sideOffset = 8,
  className,
  style,
  ...props
}: TooltipContentProps) {
  const { contentRef, triggerRef, position, color, showArrow } = useTooltip();
  const [coords, setCoords] = useState<TooltipCoords>({
    top: 0,
    left: 0,
    originX: "50%",
    originY: "50%",
  });
  const [isPositioned, setIsPositioned] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Core positioning logic
  useLayoutEffect(() => {
    if (!triggerRef.current || !contentRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const content = contentRef.current;

      // offsetWidth/Height are reliable early on
      const contentWidth = content.offsetWidth;
      const contentHeight = content.offsetHeight;

      // If still not measured, wait for Next frame
      if (contentWidth === 0 || contentHeight === 0) {
        requestAnimationFrame(updatePosition);
        return;
      }

      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let top = 0;
      let left = 0;
      let originX = "50%";
      let originY = "50%";

      switch (position) {
        case "top":
          top = triggerRect.top + scrollY - contentHeight - sideOffset;
          left =
            triggerRect.left +
            scrollX +
            triggerRect.width / 2 -
            contentWidth / 2;
          originY = "bottom";
          break;
        case "topLeft":
          top = triggerRect.top + scrollY - contentHeight - sideOffset;
          left = triggerRect.left + scrollX;
          originY = "bottom";
          originX = "left";
          break;
        case "topRight":
          top = triggerRect.top + scrollY - contentHeight - sideOffset;
          left = triggerRect.right + scrollX - contentWidth;
          originY = "bottom";
          originX = "right";
          break;
        case "bottom":
          top = triggerRect.bottom + scrollY + sideOffset;
          left =
            triggerRect.left +
            scrollX +
            triggerRect.width / 2 -
            contentWidth / 2;
          originY = "top";
          break;
        case "bottomLeft":
          top = triggerRect.bottom + scrollY + sideOffset;
          left = triggerRect.left + scrollX;
          originY = "top";
          originX = "left";
          break;
        case "bottomRight":
          top = triggerRect.bottom + scrollY + sideOffset;
          left = triggerRect.right + scrollX - contentWidth;
          originY = "top";
          originX = "right";
          break;
        case "left":
          top =
            triggerRect.top +
            scrollY +
            triggerRect.height / 2 -
            contentHeight / 2;
          left = triggerRect.left + scrollX - contentWidth - sideOffset;
          originX = "right";
          break;
        case "leftTop":
          top = triggerRect.top + scrollY;
          left = triggerRect.left + scrollX - contentWidth - sideOffset;
          originX = "right";
          originY = "top";
          break;
        case "leftBottom":
          top = triggerRect.bottom + scrollY - contentHeight;
          left = triggerRect.left + scrollX - contentWidth - sideOffset;
          originX = "right";
          originY = "bottom";
          break;
        case "right":
          top =
            triggerRect.top +
            scrollY +
            triggerRect.height / 2 -
            contentHeight / 2;
          left = triggerRect.right + scrollX + sideOffset;
          originX = "left";
          break;
        case "rightTop":
          top = triggerRect.top + scrollY;
          left = triggerRect.right + scrollX + sideOffset;
          originX = "left";
          originY = "top";
          break;
        case "rightBottom":
          top = triggerRect.bottom + scrollY - contentHeight;
          left = triggerRect.right + scrollX + sideOffset;
          originX = "left";
          originY = "bottom";
          break;
      }

      setCoords({ top, left, originX, originY });
      setIsPositioned(true);
    };

    updatePosition();

    // Watch for size changes
    const resizeObserver = new ResizeObserver(updatePosition);
    if (triggerRef.current) resizeObserver.observe(triggerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [position, sideOffset, triggerRef, contentRef]);

  // Separate effect to trigger visibility once coordinates are flushed
  useLayoutEffect(() => {
    if (isPositioned) {
      const raf = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isPositioned]);

  const arrowClasses = cn(
    "absolute w-2 h-2 rotate-45 ",
    position.startsWith("top") && "bottom-[-4px] ",
    position.startsWith("bottom") && "top-[-4px] ",
    position.startsWith("left") && "right-[-4px] ",
    position.startsWith("right") && "left-[-4px]",
    // Top arrow positions
    position === "top" && "left-1/2 -translate-x-1/2",
    position === "topLeft" && "left-4",
    position === "topRight" && "right-4",
    // Bottom arrow positions
    position === "bottom" && "left-1/2 -translate-x-1/2",
    position === "bottomLeft" && "left-4",
    position === "bottomRight" && "right-4",
    // Left arrow positions
    position === "left" && "top-1/2 -translate-y-1/2",
    position === "leftTop" && "top-3",
    position === "leftBottom" && "bottom-3",
    // Right arrow positions
    position === "right" && "top-1/2 -translate-y-1/2",
    position === "rightTop" && "top-3",
    position === "rightBottom" && "bottom-3",
  );

  return createPortal(
    <div
      ref={contentRef}
      role="tooltip"
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        zIndex: 9999,
        visibility: isVisible ? "visible" : "hidden",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.8)",
        transformOrigin: `${coords.originX} ${coords.originY}`,
        transition: isVisible
          ? "opacity 0.2s cubic-bezier(0.23, 1, 0.32, 1), transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)"
          : "none",
        pointerEvents: "none",
        backgroundColor: color || undefined,
        borderColor: color || undefined,
        ...style,
      }}
      className={cn(
        "bg-zinc-900 dark:bg-zinc-800 text-white min-w-max rounded-md px-3 py-1.5 text-sm shadow-xl",
        className,
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <div
          className={arrowClasses}
          style={{
            backgroundColor: "inherit",
            borderColor: "inherit",
          }}
        />
      )}
    </div>,
    document.body,
  );
}

interface SimpleTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  size?: TooltipSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  delayDuration?: number;
  contentClassName?: string;
  color?: string;
  trigger?: TooltipTriggerType;
  showArrow?: boolean;
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
}: SimpleTooltipProps) {
  const getSizeClasses = (): string => {
    const sizes: Record<TooltipSize, string> = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-3 text-base",
    };
    return sizes[size];
  };

  return (
    <Tooltip
      position={position}
      delayDuration={delayDuration}
      color={color}
      trigger={trigger}
      showArrow={showArrow}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={cn(getSizeClasses(), contentClassName)}>
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
};
export type { TooltipPosition, TooltipSize, TooltipTriggerType };
