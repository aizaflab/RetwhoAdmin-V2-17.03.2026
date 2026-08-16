"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import {
  addDays,
  addMonths,
  addYears,
  formatISO,
  formatLong,
  formatMonthYear,
  isSameDay,
  isToday,
  isValid,
  parseISO,
  subMonths,
  subYears,
} from "@/lib/date";
import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "@/components/icons/Icons";

import SimpleSelect from "../select/SimpleSelect";

interface CalendarProps {
  /** Applied to the text input, so an external `<label htmlFor>` can target it. */
  id?: string;
  className?: string;
  /** Selected date. Accepts an ISO `yyyy-MM-dd` string or a `Date`. */
  value?: string | Date | null;
  onValueChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  disabled?: boolean;
  readOnly?: boolean;
  showClearButton?: boolean;
  showTodayButton?: boolean;
  highlightToday?: boolean;
  allowManualInput?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  inputClass?: string;
  requiredSign?: boolean;
  required?: boolean;
  endIcon?: JSX.Element;
  useSelectHeader?: boolean;
  /** Corner radius of each day cell. */
  dayRounded?: "none" | "sm" | "md" | "lg" | "full";
  /** Outline every day cell with a subtle border. */
  dayBordered?: boolean;
  "aria-label"?: string;
}

const DAY_ROUNDED: Record<NonNullable<CalendarProps["dayRounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

interface PopupStyle {
  top: number;
  left: number;
  width: number;
  position: "absolute" | "fixed";
  zIndex: number;
}

type Placement = "bottom" | "top";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_OPTIONS = MONTH_LABELS.map((_, i) => ({
  value: String(i),
  label: new Intl.DateTimeFormat(undefined, { month: "long" }).format(
    new Date(2000, i, 1),
  ),
}));

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 101 }, (_, i) => {
  const year = currentYear - 50 + i;
  return { value: String(year), label: String(year) };
});

/** Human-readable form of the ISO `yyyy-MM-dd` input format, shown to guide typing. */
const DATE_FORMAT = "YYYY-MM-DD";

/**
 * Masks free text into the `yyyy-MM-dd` shape: keeps only digits (so letters and
 * stray characters can't be typed) and auto-inserts the `-` separators as the
 * user types, so they always see the expected format.
 */
function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = digits.slice(0, 4);
  if (digits.length > 4) out += "-" + digits.slice(4, 6);
  if (digits.length > 6) out += "-" + digits.slice(6, 8);
  return out;
}

const SPACING = 8;
// Top placement sits farther visually because the popup's `-mt-0.5` pulls it
// up (away from the trigger), so use a tighter gap on the top side.
const TOP_SPACING = 5;
const POPUP_WIDTH = 280;
const ESTIMATED_HEIGHT = 258;
const ESTIMATED_HEIGHT_SELECT = 280;

/**
 * Decides the vertical side (top/bottom) and top offset for the popup. When
 * `forced` is passed the side is reused instead of re-detected — the caller
 * locks the side after the first measured pass so scroll/resize never flips it.
 */
function resolveVerticalPlacement({
  rect,
  position,
  height,
  scrollY,
  viewportHeight,
  forced,
}: {
  rect: DOMRect;
  position: "absolute" | "fixed";
  height: number;
  scrollY: number;
  viewportHeight: number;
  forced?: Placement;
}): { top: number; placement: Placement } {
  const isFixed = position === "fixed";
  const bottomPos = rect.bottom + (isFixed ? 0 : scrollY) + SPACING;
  const topPos = isFixed
    ? rect.top - height - TOP_SPACING
    : rect.top + scrollY - height - TOP_SPACING;
  const spaceBelow = viewportHeight - (rect.bottom + SPACING);
  const spaceAbove = rect.top - SPACING;

  const useTop = forced
    ? forced === "top"
    : spaceBelow < height && spaceAbove >= height;

  return useTop
    ? { top: topPos, placement: "top" }
    : { top: bottomPos, placement: "bottom" };
}

const Calendar = forwardRef<HTMLInputElement, CalendarProps>(
  (
    {
      id,
      className = "w-70",
      value,
      onValueChange,
      placeholder = "Select date",
      minDate,
      maxDate,
      disabled = false,
      readOnly = false,
      showClearButton = true,
      showTodayButton = false,
      highlightToday = true,
      allowManualInput = true,
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      inputClass,
      requiredSign = false,
      required,
      endIcon,
      useSelectHeader = false,
      dayRounded = "full",
      dayBordered = false,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const initialDate =
      value && isValid(new Date(value)) ? new Date(value) : null;

    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    const [focusedDate, setFocusedDate] = useState<Date | null>(
      initialDate || new Date(),
    );
    const [inputValue, setInputValue] = useState<string>(
      initialDate ? formatISO(initialDate) : "",
    );
    const [isOpen, setIsOpen] = useState(false);
    const [hasCoords, setHasCoords] = useState(false);
    const [placement, setPlacement] = useState<Placement>("top");
    const [currentMonth, setCurrentMonth] = useState<Date>(
      initialDate || new Date(),
    );

    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
    const [pickerMonth, setPickerMonth] = useState(currentMonth.getMonth());

    const portalRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const popupId = useId();
    const headerId = useId();
    const gridId = useId();

    const [popupStyle, setPopupStyle] = useState<PopupStyle>({
      top: 0,
      left: 0,
      width: 0,
      position: "absolute",
      zIndex: 9999,
    });

    const getActualScrollY = () => {
      const bodyStyle = window.getComputedStyle(document.body);
      if (bodyStyle.position === "fixed") {
        const topValue = document.body.style.top;
        return topValue ? Math.abs(Number.parseInt(topValue, 10)) : 0;
      }
      return window.scrollY;
    };

    const calculatePositionBase = useCallback((): {
      rect: DOMRect;
      top: number;
      left: number;
      position: "absolute" | "fixed";
      isInModal: boolean;
    } | null => {
      if (!triggerRef.current) return null;
      const rect = triggerRef.current.getBoundingClientRect();
      const isInModal = !!triggerRef.current.closest('[role="dialog"]');

      let top: number, left: number, position: "absolute" | "fixed";
      if (isInModal) {
        top = rect.top - 8;
        left = rect.left;
        position = "fixed";
      } else {
        const scrollY = getActualScrollY();
        top = rect.top + scrollY - 8;
        left = rect.left + window.scrollX;
        position = "absolute";
      }
      return { rect, top, left, position, isInModal };
    }, []);

    // `lockedPlacementRef` pins the side after the first measure so
    // scroll/resize reposition but never flip it.
    const lockedPlacementRef = useRef<Placement | null>(null);

    // Initial (estimated) placement used the moment the popup opens, before it
    // has a measurable height. Reuses the locked side when one is set.
    const calculatePosition = useCallback(() => {
      const base = calculatePositionBase();
      if (!base) return;
      const { rect, left, position, isInModal } = base;
      const scrollY = position === "fixed" ? 0 : getActualScrollY();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - (rect.bottom + SPACING);
      const spaceAbove = rect.top - SPACING;
      const guess = useSelectHeader
        ? ESTIMATED_HEIGHT_SELECT
        : ESTIMATED_HEIGHT;
      const height = Math.min(
        guess,
        Math.max(spaceBelow, spaceAbove) - SPACING,
      );

      const { top, placement: decided } = resolveVerticalPlacement({
        rect,
        position,
        height,
        scrollY,
        viewportHeight,
        forced: lockedPlacementRef.current ?? undefined,
      });

      setPopupStyle({
        top,
        left,
        width: POPUP_WIDTH,
        position,
        zIndex: isInModal ? 10000 : 9999,
      });
      setPlacement(decided);
      setHasCoords(true);
    }, [calculatePositionBase, useSelectHeader]);

    // Source of truth once the popup is on screen: measures the real element
    // and locks the side. Only writes state when something actually changed, so
    // scrolling a page (where absolute top stays constant) causes no movement.
    const applyMeasuredPosition = useCallback(() => {
      if (!portalRef.current || !triggerRef.current) return;
      const base = calculatePositionBase();
      if (!base) return;
      const { rect, left, position, isInModal } = base;
      const scrollY = position === "fixed" ? 0 : getActualScrollY();

      const { top, placement: decided } = resolveVerticalPlacement({
        rect,
        position,
        height: portalRef.current.offsetHeight,
        scrollY,
        viewportHeight: window.innerHeight,
        forced: lockedPlacementRef.current ?? undefined,
      });
      lockedPlacementRef.current = decided; // lock the side for this open

      const next: PopupStyle = {
        top,
        left,
        width: POPUP_WIDTH,
        position,
        zIndex: isInModal ? 10000 : 9999,
      };
      // Compare against the real current state (via functional updates), not a
      // ref that a passive effect keeps stale — otherwise a synchronous
      // estimate write from openPopup makes this guard miss the correction on
      // alternating clicks, so the popup oscillates between estimate/measured.
      setPopupStyle((cur) =>
        cur.top !== next.top ||
        cur.left !== next.left ||
        cur.width !== next.width ||
        cur.position !== next.position ||
        cur.zIndex !== next.zIndex
          ? next
          : cur,
      );
      setPlacement((cur) => (cur !== decided ? decided : cur));
    }, [calculatePositionBase]);

    // Reposition whenever anything that changes the popup's height changes.
    // On top placement the bottom edge is the anchor (top = trigger - height -
    // SPACING), so a height change must re-run this or the gap above the
    // trigger grows/shrinks. `currentMonth` (4-6 week rows), the month/year
    // picker, and the select header all change the measured height.
    useLayoutEffect(() => {
      if (!isOpen) return;
      applyMeasuredPosition();
    }, [
      isOpen,
      isMonthYearPickerOpen,
      currentMonth,
      useSelectHeader,
      applyMeasuredPosition,
    ]);

    const openPopup = () => {
      if (disabled || readOnly) return;
      lockedPlacementRef.current = null; // fresh side detection for this open
      calculatePosition();
      setIsOpen(true);

      const baseDate = selectedDate ?? new Date();
      setFocusedDate(baseDate);
      setCurrentMonth(baseDate);
    };

    // AnimatePresence plays the exit animation on the way out; the exiting clone
    // keeps its last measured position, so there's no need to hold coords or
    // defer the unmount with a timeout.
    const closePopup = () => {
      setIsOpen(false);
      setIsMonthYearPickerOpen(false);
    };

    useEffect(() => {
      const handleOutside = (e: globalThis.MouseEvent) => {
        if (
          isOpen &&
          portalRef.current &&
          !portalRef.current.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) {
          closePopup();
        }
      };
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      // rAF-throttle so fast scroll/resize coalesces into one reposition per
      // frame. The side stays locked, so this only follows the trigger.
      let frame = 0;
      const handler = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          applyMeasuredPosition();
        });
      };
      window.addEventListener("scroll", handler, {
        capture: true,
        passive: true,
      });
      window.addEventListener("resize", handler);
      return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener("scroll", handler, { capture: true });
        window.removeEventListener("resize", handler);
      };
    }, [isOpen, applyMeasuredPosition]);

    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      setFocusedDate(date);
      setInputValue(formatISO(date));
      closePopup();
      onValueChange?.(date);
      inputRef.current?.focus();
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!allowManualInput) return;
      // Mask to yyyy-MM-dd so only a valid date shape can be typed.
      const v = maskDateInput(e.target.value);
      setInputValue(v);

      const parsedDate = parseISO(v);
      if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
        setFocusedDate(parsedDate);
        onValueChange?.(parsedDate);
        setCurrentMonth(parsedDate);
      }
    };

    const handleInputBlur = () => {
      if (inputValue === "") {
        setSelectedDate(null);
        setFocusedDate(new Date());
        onValueChange?.(null);
        return;
      }
      const parsed = parseISO(inputValue);
      if (isValid(parsed)) {
        setSelectedDate(parsed);
        setFocusedDate(parsed);
        setInputValue(formatISO(parsed));
        onValueChange?.(parsed);
      } else {
        setInputValue(selectedDate ? formatISO(selectedDate) : "");
      }
    };

    const handleClear = (e: MouseEvent) => {
      e?.stopPropagation?.();
      setSelectedDate(null);
      setFocusedDate(new Date());
      setInputValue("");
      onValueChange?.(null);
      inputRef.current?.focus();
    };

    const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
    const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
    const prevYear = () => setCurrentMonth((m) => subYears(m, 1));
    const nextYear = () => setCurrentMonth((m) => addYears(m, 1));

    const handleMonthChange = (v: string) =>
      setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(v), 1));
    const handleYearChange = (v: string) =>
      setCurrentMonth(new Date(parseInt(v), currentMonth.getMonth(), 1));

    const goToToday = () => {
      const today = new Date();
      setCurrentMonth(today);
      setFocusedDate(today);
      if (showTodayButton) handleDateSelect(today);
    };

    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const firstDow = first.getDay();
      const days = last.getDate();
      const cells: (Date | null)[] = [];
      for (let i = 0; i < firstDow; i++) cells.push(null);
      for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
      return cells;
    };

    const isDateDisabled = (date: Date) => {
      if (!date) return false;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    const openMonthYearPicker = () => {
      setPickerYear(currentMonth.getFullYear());
      setPickerMonth(currentMonth.getMonth());
      setIsMonthYearPickerOpen(true);
    };

    const applyMonthYearSelection = () => {
      setCurrentMonth(new Date(pickerYear, pickerMonth, 1));
      setIsMonthYearPickerOpen(false);
    };

    const renderMonthYearPicker = () => {
      const years = Array.from(
        { length: 100 },
        (_, i) => currentYear - 50 + i,
      ).reverse();

      return (
        <div className="flex h-59 w-full flex-col">
          <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
            {/* Years */}
            <div className="w-20 overflow-y-auto pr-1">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setPickerYear(year)}
                  className={cn(
                    "mb-1 w-full cursor-pointer rounded px-2 py-1.5 text-center text-xs transition-colors",
                    pickerYear === year
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Months */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 p-1">
                {MONTH_LABELS.map((monthLabel, index) => (
                  <button
                    key={monthLabel}
                    type="button"
                    onClick={() => setPickerMonth(index)}
                    className={cn(
                      "cursor-pointer rounded border py-2 text-center text-xs transition-colors",
                      pickerMonth === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-transparent bg-transparent text-foreground hover:bg-muted",
                    )}
                  >
                    {monthLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 flex justify-between gap-2 border-t border-border pt-2">
            <button
              type="button"
              onClick={() => setIsMonthYearPickerOpen(false)}
              className="cursor-pointer rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyMonthYearSelection}
              className="cursor-pointer rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Apply
            </button>
          </div>
        </div>
      );
    };

    const validPopupStyle =
      hasCoords && popupStyle.width > 0 ? popupStyle : undefined;

    const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) openPopup();
      }
      if (e.key === "Escape" && inputValue) {
        e.stopPropagation();
        handleClear(e as unknown as MouseEvent);
      }
    };

    const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!focusedDate) return;
      let next: Date | null = null;

      switch (e.key) {
        case "ArrowLeft":
          next = addDays(focusedDate, -1);
          break;
        case "ArrowRight":
          next = addDays(focusedDate, 1);
          break;
        case "ArrowUp":
          next = addDays(focusedDate, -7);
          break;
        case "ArrowDown":
          next = addDays(focusedDate, 7);
          break;
        case "Home":
          next = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1,
          );
          break;
        case "End":
          next = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0,
          );
          break;
        case "PageUp":
          setCurrentMonth((m) =>
            e.shiftKey ? subYears(m, 1) : subMonths(m, 1),
          );
          next = focusedDate;
          break;
        case "PageDown":
          setCurrentMonth((m) =>
            e.shiftKey ? addYears(m, 1) : addMonths(m, 1),
          );
          next = focusedDate;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (!isDateDisabled(focusedDate)) handleDateSelect(focusedDate);
          return;
        case "Escape":
          e.preventDefault();
          closePopup();
          inputRef.current?.focus();
          return;
        case "Tab":
          return;
        default:
          return;
      }

      if (next) {
        e.preventDefault();
        setFocusedDate(next);
        if (
          next.getFullYear() !== currentMonth.getFullYear() ||
          next.getMonth() !== currentMonth.getMonth()
        ) {
          setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1));
        }
      }
    };

    const isTabbable = (date: Date) =>
      !!focusedDate && isSameDay(date, focusedDate);

    const getDayAriaLabel = (date: Date) => {
      const extra =
        (selectedDate && isSameDay(date, selectedDate) ? " Selected." : "") +
        (isToday(date) ? " Today." : "") +
        (isDateDisabled(date) ? " Unavailable." : "");
      return `${formatLong(date)}.${extra}`.trim();
    };

    return (
      <div className={cn("relative", fullWidth ? "w-full" : className)}>
        {label && (
          <label className="mb-1 block text-sm font-medium text-foreground">
            {label}
            {(requiredSign || required) && (
              <span className="ml-1 text-destructive">*</span>
            )}
          </label>
        )}

        <div ref={triggerRef} className="relative flex items-center">
          <input
            ref={mergeRefs(ref, inputRef)}
            id={id}
            type="text"
            className={cn(
              "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              "pl-10",
              (endIcon || (showClearButton && inputValue)) && "pr-10",
              error && "border-destructive",
              inputClass,
            )}
            role="combobox"
            aria-label={ariaLabel}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? popupId : undefined}
            aria-autocomplete="none"
            placeholder={placeholder}
            value={inputValue}
            onChange={allowManualInput ? handleInputChange : undefined}
            onBlur={handleInputBlur}
            onClick={() => !disabled && !readOnly && openPopup()}
            onKeyDown={onInputKeyDown}
            readOnly={!allowManualInput || readOnly}
            disabled={disabled}
            required={required}
          />

          {allowManualInput &&
            inputValue.length > 0 &&
            inputValue.length < DATE_FORMAT.length && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center pl-10 text-sm whitespace-pre"
                aria-hidden="true"
              >
                <span className="invisible">{inputValue}</span>
                <span className="text-muted-foreground">
                  {DATE_FORMAT.slice(inputValue.length)}
                </span>
              </div>
            )}

          {startIcon ? (
            <div
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              {startIcon}
            </div>
          ) : (
            <div
              className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer text-muted-foreground"
              onClick={() => !disabled && !readOnly && openPopup()}
              aria-hidden="true"
            >
              <CalendarIcon className="h-4 w-4" />
            </div>
          )}

          {inputValue && showClearButton && !disabled && !readOnly ? (
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground"
              onClick={handleClear}
              aria-label="Clear date"
            >
              <XIcon className="h-4 w-4" />
            </button>
          ) : (
            endIcon && (
              <div
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              >
                {endIcon}
              </div>
            )
          )}
        </div>

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        )}

        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence>
              {isOpen && validPopupStyle && (
                <motion.div
                  ref={portalRef}
                  id={popupId}
                  role="dialog"
                  aria-modal="false"
                  aria-labelledby={headerId}
                  aria-describedby={gridId}
                  data-placement={placement}
                  style={{
                    ...validPopupStyle,
                    // Scale out of the edge nearest the trigger.
                    transformOrigin:
                      placement === "top" ? "bottom center" : "top center",
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                    y: placement === "top" ? 4 : -4,
                  }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    y: placement === "top" ? 4 : -4,
                  }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "absolute z-50 -mt-0.5 max-w-70 min-w-70 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg",
                  )}
                  onKeyDown={onGridKeyDown}
                >
                  {isMonthYearPickerOpen ? (
                    renderMonthYearPicker()
                  ) : (
                    <>
                      {useSelectHeader ? (
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={prevMonth}
                            className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
                            aria-label="Previous month"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>

                          <div className="flex flex-1 gap-1">
                            <div className="w-[80px] flex-1">
                              <SimpleSelect
                                options={MONTH_OPTIONS}
                                value={String(currentMonth.getMonth())}
                                onChange={handleMonthChange}
                                placeholder="Month"
                                className="h-8"
                              />
                            </div>
                            <div className="w-17.5">
                              <SimpleSelect
                                options={YEAR_OPTIONS}
                                value={String(currentMonth.getFullYear())}
                                onChange={handleYearChange}
                                placeholder="Year"
                                className="h-8"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={nextMonth}
                            className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
                            aria-label="Next month"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={prevYear}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                              aria-label="Previous year"
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={prevMonth}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                              aria-label="Previous month"
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            id={headerId}
                            className="cursor-pointer rounded px-2 py-0.5 text-sm font-medium transition-colors select-none hover:bg-muted"
                            onClick={openMonthYearPicker}
                          >
                            {formatMonthYear(currentMonth)}
                          </button>

                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={nextMonth}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                              aria-label="Next month"
                            >
                              <ChevronRightIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={nextYear}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                              aria-label="Next year"
                            >
                              <ChevronRightIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div
                        className="mb-1 grid grid-cols-7 gap-1"
                        role="row"
                        aria-hidden="true"
                      >
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                          (day) => (
                            <div
                              key={day}
                              className="py-1 text-center text-xs font-medium text-muted-foreground"
                            >
                              {day}
                            </div>
                          ),
                        )}
                      </div>

                      <div
                        id={gridId}
                        role="grid"
                        aria-label={formatMonthYear(currentMonth)}
                        className="grid grid-cols-7 gap-1"
                      >
                        {generateCalendarDays().map((date, index) => (
                          <div key={index} role="row" className="text-center">
                            {date ? (
                              <button
                                type="button"
                                role="gridcell"
                                aria-selected={
                                  selectedDate
                                    ? isSameDay(date, selectedDate)
                                    : false
                                }
                                aria-disabled={isDateDisabled(date)}
                                aria-label={getDayAriaLabel(date)}
                                tabIndex={isTabbable(date) ? 0 : -1}
                                onFocus={() => setFocusedDate(date)}
                                onMouseEnter={() => setFocusedDate(date)}
                                onClick={() =>
                                  !isDateDisabled(date) &&
                                  handleDateSelect(date)
                                }
                                className={cn(
                                  "flex h-8 w-8 cursor-pointer items-center justify-center text-sm",
                                  DAY_ROUNDED[dayRounded],
                                  dayBordered && "border border-border",
                                  isDateDisabled(date) &&
                                    "cursor-not-allowed text-muted-foreground/40",
                                  !isDateDisabled(date) && "hover:bg-muted",
                                  selectedDate &&
                                    isSameDay(date, selectedDate) &&
                                    "bg-primary text-primary-foreground hover:bg-primary/90",
                                  highlightToday &&
                                    isToday(date) &&
                                    (!selectedDate ||
                                      !isSameDay(date, selectedDate)) &&
                                    "border border-primary text-primary",
                                )}
                                disabled={isDateDisabled(date)}
                              >
                                {date.getDate()}
                              </button>
                            ) : (
                              <div className="h-8 w-8" aria-hidden="true" />
                            )}
                          </div>
                        ))}
                      </div>

                      {showTodayButton && (
                        <div className="mt-2 text-center">
                          <button
                            type="button"
                            onClick={goToToday}
                            className="cursor-pointer text-xs text-primary hover:underline"
                            aria-label="Select today"
                          >
                            Today
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>
    );
  },
);

Calendar.displayName = "Calendar";

export { Calendar };
