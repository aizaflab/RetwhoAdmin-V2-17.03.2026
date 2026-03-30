"use client";

import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import type React from "react";
import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useCallback,
} from "react";
import { CheckIcon, CaretUpOutlineIcon } from "@/components/icons/Icons";

type Option = {
  value: string;
  label: string;
  description?: string;
};

interface SearchSelectProps {
  className?: string;
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  options?: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  onValueChange?: (value: string) => void;
  onChange?: (event: { target: { value: string } }) => void;
  value?: string;
  defaultValue?: string | null;
  requiredSign?: boolean;
  required?: boolean;
  optionRenderer?: (
    option: Option,
    isSelected: boolean,
    isHighlighted: boolean,
  ) => ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  tabIndex?: number;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

type Placement = "bottom" | "top";

interface DropdownStyle {
  top: number;
  left: number;
  width: number;
  position: "absolute" | "fixed";
  zIndex: number;
  transform?: string;
  transition?: string;
}

const SearchSelect = forwardRef<HTMLButtonElement, SearchSelectProps>(
  (
    {
      className = "w-[280px]",
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      options = [],
      placeholder = "Select an option",
      searchPlaceholder = "Search...",
      onValueChange,
      onChange,
      value,
      defaultValue,
      requiredSign = false,
      optionRenderer,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    // Refs
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const listboxRef = useRef<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [placement, setPlacement] = useState<Placement>("bottom");
    const [hasCoords, setHasCoords] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [dropdownStyle, setDropdownStyle] = useState<DropdownStyle>({
      top: 0,
      left: 0,
      width: 0,
      position: "absolute",
      zIndex: 9999,
    });

    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [selectedValue, setSelectedValue] = useState<string>(
      value ?? defaultValue ?? "",
    );

    const selectedOption = options.find((o) => o.value === selectedValue);
    const displayValue = selectedOption ? selectedOption.label : "";

    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const popupId = useId();

    // Position helpers (mirrors Calendar)
    const getActualScrollY = () => {
      const bodyStyle = window.getComputedStyle(document.body);
      if (bodyStyle.position === "fixed") {
        const topValue = document.body.style.top;
        return topValue ? Math.abs(Number.parseInt(topValue, 9)) : 0;
      }
      return window.scrollY;
    };

    const calculatePositionBase = useCallback(() => {
      if (!triggerRef.current)
        return null as unknown as {
          rect: DOMRect;
          top: number;
          left: number;
          position: "absolute" | "fixed";
          isInModal: boolean;
        } | null;

      const rect = triggerRef.current.getBoundingClientRect();
      const isInModal = !!triggerRef.current.closest('[role="dialog"]');

      let top: number, left: number, position: "absolute" | "fixed";
      if (isInModal) {
        top = rect.bottom;
        left = rect.left;
        position = "fixed";
      } else {
        const scrollY = getActualScrollY();
        top = rect.bottom + scrollY;
        left = rect.left + window.scrollX;
        position = "absolute";
      }

      return { rect, top, left, position, isInModal };
    }, []);

    const calculatePosition = useCallback(
      (estimatedHeight = 280) => {
        const base = calculatePositionBase();
        if (!base) return;

        const { rect, left, position, isInModal } = base;
        const spacing = 5;
        const viewportHeight = window.innerHeight;
        const minTopPadding = 5;

        let topPosition: number;
        let decided: Placement = "bottom";
        let adjustedHeight = estimatedHeight;

        if (position === "fixed") {
          const bottomPosition = rect.bottom + spacing;
          const spaceBelow = viewportHeight - bottomPosition;
          const spaceAbove = rect.top - spacing;

          adjustedHeight = Math.min(
            estimatedHeight,
            Math.max(spaceBelow, spaceAbove) - spacing,
          );

          if (spaceBelow < adjustedHeight && spaceAbove >= adjustedHeight) {
            topPosition = Math.max(
              minTopPadding,
              rect.top - adjustedHeight - spacing,
            );
            decided = "top";
          } else {
            topPosition = bottomPosition;
            decided = "bottom";
          }
        } else {
          const scrollY = getActualScrollY();
          const bottomPosition = rect.bottom + scrollY + spacing;
          const spaceBelow = viewportHeight - (rect.bottom + spacing);
          const spaceAbove = rect.top - spacing;

          adjustedHeight = Math.min(
            estimatedHeight,
            Math.max(spaceBelow, spaceAbove) - spacing,
          );

          if (spaceBelow < adjustedHeight && spaceAbove >= adjustedHeight) {
            topPosition = Math.max(
              scrollY + minTopPadding,
              rect.top + scrollY - adjustedHeight - spacing - 58,
            );
            decided = "top";
          } else {
            topPosition = bottomPosition;
            decided = "bottom";
          }
        }

        setDropdownStyle({
          top: topPosition,
          left,
          width: rect.width || 280,
          position,
          zIndex: isInModal ? 10000 : 9999,
        });
        setPlacement(decided);
        setHasCoords(true);
      },
      [calculatePositionBase],
    );

    useLayoutEffect(() => {
      if (!isOpen || !portalRef.current || !triggerRef.current) return;

      const popupEl = portalRef.current;
      const base = calculatePositionBase();
      if (!base) return;

      const { rect, left, position, isInModal } = base;
      const popupH = popupEl.offsetHeight;
      const spacing = 5;
      const viewportHeight = window.innerHeight;
      const minTopPadding = 5;

      let topPosition: number;
      let decided = placement;

      if (position === "fixed") {
        const bottomPosition = rect.bottom + spacing;
        const spaceBelow = viewportHeight - bottomPosition;
        const spaceAbove = rect.top - spacing;

        if (spaceBelow < popupH && spaceAbove >= popupH) {
          topPosition = Math.max(minTopPadding, rect.top - popupH - spacing);
          decided = "top";
        } else {
          topPosition = bottomPosition;
          decided = "bottom";
        }
      } else {
        const scrollY = getActualScrollY();
        const bottomPosition = rect.bottom + scrollY + spacing;
        const spaceBelow = viewportHeight - (rect.bottom + spacing);
        const spaceAbove = rect.top - spacing;

        if (spaceBelow < popupH && spaceAbove >= popupH) {
          topPosition = Math.max(
            scrollY + minTopPadding,
            rect.top + scrollY - popupH - spacing,
          );
          decided = "top";
        } else {
          topPosition = bottomPosition;
          decided = "bottom";
        }
      }
      const newStyle: DropdownStyle = {
        top: topPosition,
        left,
        width: rect.width || popupEl.offsetWidth || 280,
        position,
        zIndex: isInModal ? 10000 : 9999,
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDropdownStyle((prev) => {
        if (
          prev.top === newStyle.top &&
          prev.left === newStyle.left &&
          prev.width === newStyle.width &&
          prev.position === newStyle.position &&
          prev.zIndex === newStyle.zIndex
        ) {
          return prev;
        }
        return newStyle;
      });

      if (placement !== decided) {
        setPlacement(decided);
      }
    }, [isOpen, isVisible, calculatePositionBase, placement]);

    useEffect(() => {
      if (!isOpen) return;
      const handler = () =>
        calculatePosition(listboxRef.current?.offsetHeight || 280);
      window.addEventListener("scroll", handler, {
        capture: true,
        passive: true,
      });
      window.addEventListener("resize", handler);
      return () => {
        window.removeEventListener("scroll", handler, { capture: true });
        window.removeEventListener("resize", handler);
      };
    }, [isOpen, calculatePosition]);

    const openDropdown = () => {
      if (disabled) return;

      // Calculate a better estimated height to avoid flip-flops between top/bottom
      const itemHeight = 36;
      const padding = 60; // Extra for search input
      const estimatedHeight = Math.min(
        280,
        (options?.length || 0) * itemHeight + padding,
      );

      calculatePosition(estimatedHeight);
      setIsOpen(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      });
    };

    const closeDropdown = () => {
      setIsVisible(false);
      setTimeout(() => {
        setIsOpen(false);
        setHasCoords(false);
        setSearchQuery("");
        setDropdownStyle((s) => ({ ...s, top: 0, left: 0, width: 0 }));
      }, 150);
    };

    // Outside click
    useEffect(() => {
      const handleOutside = (e: globalThis.MouseEvent) => {
        if (
          isOpen &&
          portalRef.current &&
          !portalRef.current.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) {
          closeDropdown();
        }
      };
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }, [isOpen]);

    // Keyboard
    const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) openDropdown();
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          closeDropdown();
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            (
              listboxRef.current?.children?.[next] as HTMLElement | undefined
            )?.scrollIntoView({
              block: "nearest",
            });
            return next;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            (
              listboxRef.current?.children?.[next] as HTMLElement | undefined
            )?.scrollIntoView({
              block: "nearest",
            });
            return next;
          });
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex].value);
          }
          break;
      }
    };

    const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            (
              listboxRef.current?.children?.[next] as HTMLElement | undefined
            )?.scrollIntoView({
              block: "nearest",
            });
            return next;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            (
              listboxRef.current?.children?.[next] as HTMLElement | undefined
            )?.scrollIntoView({
              block: "nearest",
            });
            return next;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeDropdown();
          break;
      }
    };

    // Selection
    const handleOptionSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      const syntheticEvent = { target: { value: optionValue } };
      onChange?.(syntheticEvent);
      onValueChange?.(optionValue);
      closeDropdown();
    };

    // Option renderer
    const defaultOptionRenderer = (
      option: Option,
      isSelected: boolean,
      isHighlighted: boolean,
    ) => (
      <div
        className={cn(
          "flex items-center justify-between text-sm px-3 py-2.5 cursor-pointer rounded w-full",
          isSelected
            ? "dark:bg-darkBorder bg-text4/40 dark:text-white text-black"
            : "hover:bg-text4/30 dark:hover:bg-darkBorder/30 dark:text-text5",
          isHighlighted && !isSelected ? "dark:bg-darkBorder bg-text5" : "",
        )}
      >
        <div className="flex items-center">
          <span>{option.label}</span>
          {option.description && (
            <span className="ml-2 text-xs text-muted-foreground">
              {option.description}
            </span>
          )}
        </div>
        {isSelected && <CheckIcon className="size-4 shrink-0 ml-2" />}
      </div>
    );

    const renderOption = optionRenderer || defaultOptionRenderer;

    const validDropdownStyle =
      hasCoords && dropdownStyle.width > 0 ? dropdownStyle : undefined;

    // Render
    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth ? "w-full" : "",
          className,
        )}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            {label}
            {(requiredSign || required) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}

        <div ref={triggerRef} className="relative">
          <button
            type="button"
            className={cn(
              "flex sm:h-11 h-10 w-full items-center justify-between rounded-md border border-border dark:border-darkBorder bg-background px-3 py-2 text-sm focus:outline-none focus:border-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all",
              startIcon ? "pl-10" : "",
              error ? "border-destructive" : "",
            )}
            onClick={() => (isOpen ? closeDropdown() : openDropdown())}
            onKeyDown={onButtonKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? popupId : undefined}
            ref={(node) => {
              buttonRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref)
                (
                  ref as React.MutableRefObject<HTMLButtonElement | null>
                ).current = node;
            }}
            disabled={disabled}
            {...props}
          >
            <div className="flex items-center">
              {startIcon && (
                <span className="absolute left-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-300">
                  {startIcon}
                </span>
              )}
              <span
                className={cn(
                  "truncate",
                  !selectedValue ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {displayValue || placeholder}
              </span>
            </div>
            {endIcon ? (
              <span
                className={cn(
                  "flex items-center text-gray-500 dark:text-gray-300 ani3 text-lg",
                  isOpen ? "rotate-0" : "rotate-180",
                )}
              >
                {endIcon}
              </span>
            ) : (
              <span className="flex items-center text-gray-500">
                <CaretUpOutlineIcon
                  className={cn(
                    "ani3 size-7",
                    isOpen ? "rotate-0" : "rotate-180",
                  )}
                />
              </span>
            )}
          </button>
        </div>

        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-destructive font-medium">{error}</p>
        )}

        {typeof document !== "undefined" &&
          isOpen &&
          validDropdownStyle &&
          createPortal(
            <div
              ref={portalRef}
              id={popupId}
              role="listbox"
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `${popupId}-opt-${highlightedIndex}`
                  : undefined
              }
              data-placement={placement}
              style={{
                ...validDropdownStyle,
                transformOrigin: placement === "top" ? "top" : "bottom",
              }}
              className={cn(
                "absolute z-9999 rounded-md border border-border dark:border-darkBorder/80 dark:bg-darkPrimary bg-white shadow-md p-1.5 min-w-[200px] max-w-full transition duration-150 ease-in-out will-change-transform",
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : placement === "top"
                    ? "opacity-0 -translate-y-2 scale-95"
                    : "opacity-0 translate-y-2 scale-95",
              )}
            >
              <div className="px-1.5 pb-1.5">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={onSearchKeyDown}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-border dark:border-darkBorder dark:bg-darkPrimary bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:border-muted-foreground/50 transition-all"
                />
              </div>

              <div
                ref={listboxRef}
                className="max-h-60 overflow-auto rounded-md space-y-1 bg-popover sideBar"
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {searchQuery ? "No options found" : "No options available"}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      id={`${popupId}-opt-${index}`}
                      key={option.value}
                      role="option"
                      aria-selected={selectedValue === option.value}
                      tabIndex={-1}
                      onClick={() => handleOptionSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                    >
                      {renderOption(
                        option,
                        selectedValue === option.value,
                        highlightedIndex === index,
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

SearchSelect.displayName = "SearchSelect";

export { SearchSelect };
