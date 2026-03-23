"use client";
import React, {
  type ReactElement,
  type ReactNode,
  type MouseEvent,
  type CSSProperties,
} from "react";
import { useState, useRef, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, CheckIcon } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  activeIndex: number;
  setActiveIndex: (index: number | ((prev: number) => number)) => void;
  registerItem: (index: number, ref: HTMLElement) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  disabled: boolean;
}

// Context for dropdown state management
const DropdownContext = createContext<DropdownContextValue>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  activeIndex: -1,
  setActiveIndex: () => {},
  registerItem: () => {},
  triggerRef: { current: null },
  menuRef: { current: null },
  disabled: false,
});

interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Dropdown({
  children,
  className,
  fullWidth = false,
  disabled = false,
  onOpenChange,
  ...props
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLElement[]>([]);

  const toggle = () => {
    if (!disabled) {
      const nextOpen = !isOpen;
      setIsOpen(nextOpen);
      onOpenChange?.(nextOpen);
      setActiveIndex(-1);
    }
  };

  const close = () => {
    setIsOpen(false);
    onOpenChange?.(false);
    setActiveIndex(-1);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < itemsRef.current.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : itemsRef.current.length - 1,
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (activeIndex >= 0 && itemsRef.current[activeIndex]) {
            itemsRef.current[activeIndex].click();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex]);

  // Focus active item
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && itemsRef.current[activeIndex]) {
      itemsRef.current[activeIndex].focus();
    }
  }, [isOpen, activeIndex]);

  // Register item refs
  const registerItem = (index: number, ref: HTMLElement) => {
    itemsRef.current[index] = ref;
  };

  const contextValue: DropdownContextValue = {
    isOpen,
    toggle,
    close,
    activeIndex,
    setActiveIndex,
    registerItem,
    triggerRef,
    menuRef,
    disabled,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={dropdownRef}
        className={cn(
          "relative inline-block text-left",
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Dropdown trigger component
interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
  showChevron?: boolean;
  icon?: ReactNode;
}

export function DropdownTrigger({
  children,
  className,
  asChild = false,
  showChevron = true,
  icon,
  ...props
}: DropdownTriggerProps) {
  const { toggle, isOpen, disabled, triggerRef, setActiveIndex } =
    useContext(DropdownContext);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Handle open/toggle with keyboard
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();

      if (e.key === "ArrowDown") {
        if (!isOpen) {
          toggle();
          setActiveIndex(0);
        }
        // If already open, let the document listener handle navigation
      } else {
        // Enter or Space
        toggle();
        if (!isOpen) {
          setActiveIndex(0);
        }
      }
    }

    // Call original handler if exists
    props.onKeyDown?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    const childElement = children as ReactElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childRef = (childElement as any).ref;

    const mergedRef = (node: HTMLButtonElement) => {
      // Update context triggerRef
      if (triggerRef) {
        (
          triggerRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
      }

      // Update child's original ref
      if (childRef) {
        if (typeof childRef === "function") {
          childRef(node);
        } else {
          // eslint-disable-next-line
          (childRef as React.MutableRefObject<any>).current = node;
        }
      }
    };

    return React.cloneElement(childElement, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(childElement.props as any),
      onClick: (e: MouseEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (childElement.props as any).onClick?.(e);
        toggle();
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (childElement.props as any).onKeyDown?.(e);
        handleKeyDown(e);
      },
      "aria-expanded": isOpen,
      "aria-haspopup": true,
      disabled,
      ref: mergedRef,
    });
  }

  // Default trigger button
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium cursor-pointer",
        "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white",
        "border border-gray-200 dark:border-white/10 rounded-md",
        "hover:bg-gray-50 dark:hover:bg-white/5",
        "focus:outline-none focus:border-border",
        "transition-all duration-200 ease-out",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        showChevron ? "justify-between" : "justify-center",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="true"
      disabled={disabled}
      ref={triggerRef}
      {...props}
    >
      <div className={cn("flex items-center gap-2", showChevron && "flex-1")}>
        {icon && <span className="shrink-0 opacity-80">{icon}</span>}
        <span className={cn(showChevron && "text-left")}>{children}</span>
      </div>
      {showChevron && (
        <ChevronDownIcon
          className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform duration-300 ease-out",
            isOpen && "transform rotate-180",
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

type DropdownSide = "top" | "bottom" | "left" | "right";
type DropdownAlign = "start" | "center" | "end" | "left" | "right";

interface PositionResult {
  style: CSSProperties;
  effectiveSide: DropdownSide;
}

// Calculate optimal position for dropdown menu
// Calculate optimal position for dropdown menu
function calculatePosition(
  triggerElement: HTMLElement,
  menuElement: HTMLElement,
  side: DropdownSide,
  align: DropdownAlign,
  offset: number,
): PositionResult {
  if (!triggerElement || !menuElement)
    return { style: {}, effectiveSide: side };

  const trigger = triggerElement.getBoundingClientRect();
  const menuWidth = menuElement.offsetWidth;
  const menuHeight = menuElement.offsetHeight;
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Map legacy align values
  let effectiveAlign = align;
  if (align === "left") effectiveAlign = "start";
  if (align === "right") effectiveAlign = "end";

  let top = 0;
  let left = 0;

  // Initial positioning based on side
  switch (side) {
    case "top":
      top = trigger.top + scrollY - menuHeight - offset;
      break;
    case "bottom":
      top = trigger.bottom + scrollY + offset;
      break;
    case "left":
      left = trigger.left + scrollX - menuWidth - offset;
      break;
    case "right":
      left = trigger.right + scrollX + offset;
      break;
  }

  // Initial alignment
  if (side === "top" || side === "bottom") {
    switch (effectiveAlign) {
      case "start":
        left = trigger.left + scrollX;
        break;
      case "center":
        left = trigger.left + scrollX + (trigger.width - menuWidth) / 2;
        break;
      case "end":
        left = trigger.right + scrollX - menuWidth;
        break;
    }
  } else {
    // left or right side
    switch (effectiveAlign) {
      case "start":
        top = trigger.top + scrollY;
        break;
      case "center":
        top = trigger.top + scrollY + (trigger.height - menuHeight) / 2;
        break;
      case "end":
        top = trigger.bottom + scrollY - menuHeight;
        break;
    }
  }

  let finalSide = side;

  // Vertical Collision
  if (side === "top" && top < scrollY) {
    // Flip to bottom
    const newTop = trigger.bottom + scrollY + offset;
    if (newTop + menuHeight <= scrollY + viewport.height) {
      top = newTop;
      finalSide = "bottom";
    }
  } else if (
    side === "bottom" &&
    top + menuHeight > scrollY + viewport.height
  ) {
    // Flip to top
    const newTop = trigger.top + scrollY - menuHeight - offset;
    if (newTop >= scrollY) {
      top = newTop;
      finalSide = "top";
    }
  }

  // Horizontal Collision
  if (side === "left" && left < scrollX) {
    // Flip to right
    const newLeft = trigger.right + scrollX + offset;
    if (newLeft + menuWidth <= scrollX + viewport.width) {
      left = newLeft;
      finalSide = "right";
    }
  } else if (side === "right" && left + menuWidth > scrollX + viewport.width) {
    // Flip to left
    const newLeft = trigger.left + scrollX - menuWidth - offset;
    if (newLeft >= scrollX) {
      left = newLeft;
      finalSide = "left";
    }
  }

  // Boundary constraints
  if (side === "top" || side === "bottom") {
    const minLeft = scrollX + offset;
    const maxLeft = scrollX + viewport.width - menuWidth - offset;
    left = Math.max(minLeft, Math.min(left, maxLeft));
  } else {
    const minTop = scrollY + offset;
    const maxTop = scrollY + viewport.height - menuHeight - offset;
    top = Math.max(minTop, Math.min(top, maxTop));
  }

  return {
    style: {
      position: "absolute",
      top: `${top}px`,
      left: `${left}px`,
      minWidth:
        finalSide === "top" || finalSide === "bottom"
          ? `${trigger.width}px`
          : "auto",
    },
    effectiveSide: finalSide,
  };
}

// Dropdown menu component with portal
interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  side?: DropdownSide;
  align?: DropdownAlign;
  offset?: number;
}

export function DropdownMenu({
  children,
  className,
  side = "bottom",
  align = "start",
  offset = 7,
  ...props
}: DropdownMenuProps) {
  const { isOpen, menuRef, triggerRef } = useContext(DropdownContext);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [positionStyle, setPositionStyle] = useState<CSSProperties>({});
  const [effectiveSide, setEffectiveSide] = useState<DropdownSide>(
    side as DropdownSide,
  );

  // Handle animation timing and positioning
  useEffect(() => {
    let isActive = true;
    let timer: NodeJS.Timeout | undefined;

    if (isOpen) {
      requestAnimationFrame(() => {
        if (!isActive) return;
        setShouldRender(true);
      });

      // We need to wait for the next frame after shouldRender is true
      // so that menuRef.current is populated by React
      const checkAndPosition = () => {
        if (!isActive) return;

        if (triggerRef.current && menuRef.current) {
          const { style, effectiveSide: realSide } = calculatePosition(
            triggerRef.current!,
            menuRef.current!,
            side as DropdownSide,
            align as DropdownAlign,
            offset,
          );
          setPositionStyle(style);
          setEffectiveSide(realSide);
          setIsVisible(true);
        } else {
          // If not yet available, try again in next frame
          requestAnimationFrame(checkAndPosition);
        }
      };

      requestAnimationFrame(checkAndPosition);
    } else {
      requestAnimationFrame(() => {
        if (!isActive) return;
        setIsVisible(false);
      });
      timer = setTimeout(() => {
        if (!isActive) return;
        setShouldRender(false);
        setPositionStyle({});
      }, 150);
    }

    return () => {
      isActive = false;
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, side, align, offset, triggerRef, menuRef]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !menuRef.current) return;
      const { style, effectiveSide: realSide } = calculatePosition(
        triggerRef.current!,
        menuRef.current!,
        side as DropdownSide,
        align as DropdownAlign,
        offset,
      );
      setPositionStyle(style);
      setEffectiveSide(realSide);
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, side, align, offset, triggerRef, menuRef]);

  if (!shouldRender) return null;

  const menuContent = (
    <div
      className={cn(
        "absolute z-50 overflow-hidden rounded-md",
        "bg-white dark:bg-[#1a1a1a]",
        "border border-gray-200 dark:border-white/10",
        "shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
        "transition-all duration-150 ease-out",
        effectiveSide === "top" && "origin-bottom",
        effectiveSide === "bottom" && "origin-top",
        effectiveSide === "left" && "origin-right",
        effectiveSide === "right" && "origin-left",
        isVisible
          ? "opacity-100 scale-100 translate-y-0 translate-x-0"
          : cn(
              "opacity-0 scale-95 pointer-events-none",
              effectiveSide === "top" && "translate-y-1",
              effectiveSide === "bottom" && "-translate-y-1",
              effectiveSide === "left" && "translate-x-1",
              effectiveSide === "right" && "-translate-x-1",
            ),
        className,
      )}
      style={positionStyle}
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );

  // Use portal to render menu at document body level
  return typeof document !== "undefined"
    ? createPortal(menuContent, document.body)
    : null;
}

// Dropdown item component
interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  icon?: ReactNode;
  shortcut?: ReactNode;
  destructive?: boolean;
}

export function DropdownItem({
  children,
  className,
  disabled = false,
  selected = false,
  destructive = false,
  onClick,
  icon,
  shortcut,
  ...props
}: DropdownItemProps) {
  const { close, activeIndex, setActiveIndex, registerItem } =
    useContext(DropdownContext);
  const itemRef = useRef<HTMLButtonElement>(null);
  const [itemIndex, setItemIndex] = useState(-1);

  // Get index for this item
  useEffect(() => {
    if (itemRef.current) {
      const items = itemRef.current
        .closest('[role="menu"]')
        ?.querySelectorAll('[role="menuitem"]');
      if (items) {
        const idx = Array.from(items).indexOf(itemRef.current);
        setItemIndex(idx);
        registerItem(idx, itemRef.current);
      }
    }
  }, [registerItem]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
    close();
  };

  return (
    <button
      className={cn(
        "relative flex items-center w-full px-3 py-1.5 text-sm rounded-md mb-0.5 last:mb-0",
        "text-left outline-none select-none",
        "transition-colors duration-150 ease-out",
        destructive
          ? "text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/20"
          : "text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/5",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        selected && !destructive && "bg-gray-100 dark:bg-white/10 font-medium",
        activeIndex === itemIndex && !disabled && "bg-gray-100 dark:bg-white/5",
        className,
      )}
      role="menuitem"
      onClick={handleClick}
      ref={itemRef}
      onMouseEnter={() => !disabled && setActiveIndex(itemIndex)}
      disabled={disabled}
      tabIndex={-1}
      {...props}
    >
      {icon && <span className="mr-2.5 shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span
          className={cn(
            "ml-auto text-xs tracking-widest pl-2",
            destructive ? "opacity-70" : "text-muted-foreground",
          )}
        >
          {shortcut}
        </span>
      )}
      {selected && (
        <CheckIcon
          className="ml-2 h-4 w-4 shrink-0 text-primary"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// Dropdown separator component
interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function DropdownSeparator({
  className,
  ...props
}: DropdownSeparatorProps) {
  return (
    <div
      className={cn("h-px my-1.5 bg-gray-100 dark:bg-white/10", className)}
      role="separator"
      {...props}
    />
  );
}

// Dropdown label component
interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function DropdownLabel({
  children,
  className,
  ...props
}: DropdownLabelProps) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.05em]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
