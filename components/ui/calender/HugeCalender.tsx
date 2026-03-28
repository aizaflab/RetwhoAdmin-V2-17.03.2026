"use client";

import {
  useId,
  useRef,
  useState,
  useEffect,
  forwardRef,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from "react";

import {
  format,
  isToday,
  addDays,
  endOfDay,
  isSameDay,
  addMonths,
  startOfDay,
  endOfMonth,
  startOfMonth,
  differenceInDays,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";

import { cn } from "../../../lib/utils";
import { createPortal } from "react-dom";
import SimpleSelect from "../select/SimpleSelect";
import { CalendarIcon, XIcon } from "@/components/icons/Icons";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

type DateDesignStyle = "minimal" | "box";
type DateShape = "" | "rounded-sm" | "rounded-md" | "rounded-full";
type Variant = "professional";
type Align = "left" | "right";

interface PopupStyle {
  top: number;
  left: number;
  width: number | string;
  position: "absolute" | "fixed";
  zIndex: number;
  transform?: string;
}

interface Shortcut {
  label: string;
  getValue?: () => DateRange;
}

export interface HugeCalenderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  className?: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  showClearButton?: boolean;
  highlightToday?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  inputClass?: string;
  requiredSign?: boolean;
  gridBox?: boolean;
  variant?: Variant;
  dateDesignStyle?: DateDesignStyle;
  dateShape?: DateShape;
  align?: Align;
  showTime?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const QUICK_SHORTCUTS: Shortcut[] = [
  { label: "Today", getValue: () => ({ start: new Date(), end: new Date() }) },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = addDays(new Date(), -1);
      return { start: yesterday, end: yesterday };
    },
  },
  {
    label: "This Week",
    getValue: () => {
      const today = new Date();
      const startOfWeek = addDays(today, -today.getDay());
      return { start: startOfWeek, end: today };
    },
  },
  {
    label: "Last Week",
    getValue: () => {
      const today = new Date();
      const lastWeekEnd = addDays(today, -today.getDay() - 1);
      const lastWeekStart = addDays(lastWeekEnd, -6);
      return { start: lastWeekStart, end: lastWeekEnd };
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const today = new Date();
      return { start: startOfMonth(today), end: today };
    },
  },
  {
    label: "Last Month",
    getValue: () => {
      const today = new Date();
      const lastMonth = addMonths(today, -1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "Last 6 Months",
    getValue: () => {
      const today = new Date();
      return { start: addMonths(today, -6), end: today };
    },
  },
  {
    label: "This Year",
    getValue: () => {
      const today = new Date();
      return { start: new Date(today.getFullYear(), 0, 1), end: today };
    },
  },
  {
    label: "Last Year",
    getValue: () => {
      const today = new Date();
      const lastYear = today.getFullYear() - 1;
      return {
        start: new Date(lastYear, 0, 1),
        end: new Date(lastYear, 11, 31),
      };
    },
  },
  { label: "Custom" },
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const MONTHS_OPTIONS = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
] as const;

const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

const HugeCalender = forwardRef<HTMLInputElement, HugeCalenderProps>(
  (
    {
      className,
      value = { start: null, end: null },
      onChange,
      placeholder = "Select date range",
      minDate,
      maxDate,
      disabled = false,
      readOnly = false,
      showClearButton = true,
      highlightToday = true,
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      inputClass = "w-[355px]",
      requiredSign = false,
      gridBox = false,
      required,
      endIcon,
      variant = "professional",
      dateDesignStyle = "minimal",
      dateShape = "",
      align = "left",
      showTime = false,
      ...props
    },
    ref,
  ) => {
    /* ---------- RANGE STATE ---------- */
    const [dateRange, setDateRange] = useState<DateRange>(value);
    const [selectingStart, setSelectingStart] = useState<boolean>(true);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

    /* ---------- TIME DISPLAY (controlled by showTime prop) ---------- */
    const startHour = "12";
    const startMin = "00";
    const startPeriod = "AM";
    const endHour = "11";
    const endMin = "59";
    const endPeriod = "PM";

    /* ---------- CALENDAR NAV & FOCUS ---------- */
    const baseInitialMonth = startOfMonth(
      dateRange.start ?? dateRange.end ?? new Date(),
    );

    const [leftMonth, setLeftMonth] = useState<Date>(baseInitialMonth);
    const [rightMonth, setRightMonth] = useState<Date>(
      addMonths(baseInitialMonth, 1),
    );

    const [focusedDate, setFocusedDate] = useState<Date>(
      dateRange.start ?? dateRange.end ?? new Date(),
    );

    /* ---------- MONTH/YEAR PICKER STATE ---------- */
    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] =
      useState<boolean>(false);

    /* ---------- POPUP / POSITION ---------- */
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [hasCoords, setHasCoords] = useState<boolean>(false);
    const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
    const [popupStyle, setPopupStyle] = useState<PopupStyle>({
      top: 0,
      left: 0,
      width: 0,
      position: "absolute",
      zIndex: 9999,
    });

    const portalRefC = useRef<HTMLDivElement | null>(null);
    const triggerRefc = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const popupId = useId();
    const headerId = useId();
    const gridId = useId();

    /* ---------- HELPERS ---------- */

    const getActualScrollY = (): number => {
      if (typeof window === "undefined") return 0;
      const bodyStyle = window.getComputedStyle(document.body);
      if (bodyStyle.position === "fixed") {
        const topValue = document.body.style.top;
        return topValue ? Math.abs(Number.parseInt(topValue, 10)) : 0;
      }
      return window.scrollY;
    };

    const calculatePositionBase = () => {
      if (!triggerRefc.current || typeof window === "undefined") return null;
      const rect = triggerRefc.current.getBoundingClientRect();
      const isInModal = !!triggerRefc.current.closest('[role="dialog"]');
      const left = rect.left;
      const position: "absolute" | "fixed" = isInModal ? "fixed" : "absolute";
      return { rect, left, position, isInModal };
    };

    const calculatePosition = () => {
      const base = calculatePositionBase();
      if (!base || typeof window === "undefined") return;

      const { rect, left, position, isInModal } = base;
      const spacing = 8;

      let topPosition: number;

      if (position === "fixed") {
        topPosition = rect.bottom + spacing;
      } else {
        const scrollY = getActualScrollY();
        topPosition = rect.bottom + scrollY + spacing;
      }

      setPopupStyle({
        top: topPosition,
        left: align === "right" ? rect.right : left,
        width: "max-content",
        position,
        zIndex: isInModal ? 10000 : 9999,
        transform: align === "right" ? "translateX(-100%)" : "none",
      });

      setPlacement("bottom");
      setHasCoords(true);
    };

    const openPopup = () => {
      if (disabled || readOnly) return;
      calculatePosition();
      setIsOpen(true);
      requestAnimationFrame(() => setIsVisible(true));

      const baseDate = dateRange.start ?? dateRange.end ?? new Date();
      const baseMonth = startOfMonth(baseDate);

      setFocusedDate(baseDate);
      setLeftMonth(baseMonth);
      setRightMonth(addMonths(baseMonth, 1));
    };

    const closePopup = () => {
      setIsVisible(false);
      setTimeout(() => {
        setIsOpen(false);
        setHasCoords(false);
        setPopupStyle((s) => ({ ...s, top: 0, left: 0, width: 0 }));
        setIsMonthYearPickerOpen(false);
      }, 150);
    };

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < startOfDay(minDate)) return true;
      if (maxDate && date > endOfDay(maxDate)) return true;
      return false;
    };

    const getDaysInMonthList = (date: Date): (Date | null)[] => {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const days: (Date | null)[] = [];

      const startDay = start.getDay();
      for (let i = 0; i < startDay; i++) {
        days.push(null);
      }

      const daysInMonth = eachDayOfInterval({ start, end });
      days.push(...daysInMonth);
      return days;
    };

    const isInRange = (date: Date): boolean => {
      if (!dateRange.start || !dateRange.end) return false;
      return isWithinInterval(date, {
        start: startOfDay(dateRange.start),
        end: endOfDay(dateRange.end),
      });
    };

    const isRangeStart = (date: Date): boolean =>
      !!dateRange.start && isSameDay(date, dateRange.start);

    const isRangeEnd = (date: Date): boolean =>
      !!dateRange.end && isSameDay(date, dateRange.end);

    const isInHoverRange = (date: Date): boolean => {
      if (!dateRange.start || !hoverDate || selectingStart) return false;
      const start = dateRange.start;
      const end = hoverDate;
      const minD = start < end ? start : end;
      const maxD = start < end ? end : start;

      return isWithinInterval(date, {
        start: startOfDay(minD),
        end: endOfDay(maxD),
      });
    };

    const getDaysCount = (): number => {
      if (dateRange.start && dateRange.end) {
        return (
          differenceInDays(
            endOfDay(dateRange.end),
            startOfDay(dateRange.start),
          ) + 1
        );
      }
      return 0;
    };

    const formatDateHeader = (): string => {
      if (dateRange.start && dateRange.end) {
        const startStr = format(dateRange.start, "MM.d.yyyy");
        const endStr = format(dateRange.end, "MM.d.yyyy");

        if (showTime) {
          const startTime = `${startHour}:${startMin} ${startPeriod}`;
          const endTime = `${endHour}:${endMin} ${endPeriod}`;
          return `${startStr} ${startTime} – ${endStr} ${endTime}`;
        }

        return `${startStr} – ${endStr}`;
      }
      return placeholder ?? "";
    };

    const hasRange = !!(dateRange.start || dateRange.end);

    const getDateStyles = (
      isStart: boolean,
      isEnd: boolean,
      inRange: boolean,
      inHover: boolean,
      isTodayDate: boolean,
      disabledDate: boolean,
    ): string => {
      const shapeClass = dateShape || "rounded-md";

      if (disabledDate) {
        return `${shapeClass} text-gray-300 cursor-not-allowed`;
      }

      const inFullRange = inRange || inHover;

      if (dateDesignStyle === "box") {
        if (isStart || isEnd) {
          return `${shapeClass} bg-gray-400 dark:bg-darkBorder text-white border border-gray-400 dark:border-darkBorder font-semibold`;
        }
        if (inFullRange) {
          return `${shapeClass} bg-gray-100 dark:bg-darkBorder text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-darkBorder`;
        }
        if (highlightToday && isTodayDate) {
          return `${shapeClass} border border-gray-500 dark:border-darkBorder text-gray-600 dark:text-gray-200 bg-white dark:bg-darkBorder font-semibold`;
        }
        return `${shapeClass} border border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-darkBorder`;
      }

      // minimal
      if (isStart || isEnd) {
        return `${shapeClass} bg-gray-300 dark:bg-darkBorder text-black`;
      }
      if (inFullRange) {
        return `${shapeClass} bg-gray-100 dark:bg-darkBorder text-gray-900 dark:text-gray-100`;
      }
      if (highlightToday && isTodayDate) {
        return `${shapeClass} text-gray-600 dark:text-gray-400 border font-semibold`;
      }
      return `${shapeClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3A3A3A]`;
    };

    const handleDateClick = (date: Date) => {
      if (isDateDisabled(date)) return;

      let newRange: DateRange = { ...dateRange };

      if (
        selectingStart ||
        !dateRange.start ||
        (dateRange.start && dateRange.end)
      ) {
        newRange = { start: date, end: null };
        setSelectingStart(false);
        setActiveShortcut(null);
      } else {
        if (dateRange.start && date < dateRange.start) {
          newRange = { start: date, end: dateRange.start };
        } else {
          newRange = { start: dateRange.start, end: date };
        }
        setSelectingStart(true);
        setActiveShortcut("Custom");
      }

      setDateRange(newRange);
      setHoverDate(null);
      setFocusedDate(date);
      onChange?.(newRange);
    };

    const handleShortcut = (label: string, getValue: () => DateRange) => {
      const range = getValue();
      setDateRange(range);
      setSelectingStart(true);
      setActiveShortcut(label);
      setHoverDate(null);

      if (range.start) {
        const base = startOfMonth(range.start);
        setLeftMonth(base);
        setRightMonth(addMonths(base, 1));
        setFocusedDate(range.start);
      }

      onChange?.(range);
    };

    const handleClear = (e?: MouseEvent<HTMLButtonElement>) => {
      e?.stopPropagation?.();
      const emptyRange: DateRange = { start: null, end: null };
      setDateRange(emptyRange);
      setSelectingStart(true);
      setHoverDate(null);
      setActiveShortcut(null);
      setFocusedDate(new Date());
      onChange?.(emptyRange);
      inputRef.current?.focus();
    };

    /* ---------- EFFECTS ---------- */

    useEffect(() => {
      if (!isOpen) return;
      const handleOutside = (e: Event) => {
        const target = e.target as Node;
        if (
          portalRefC.current &&
          (portalRefC.current.contains(target) ||
            triggerRefc.current?.contains(target))
        ) {
          return;
        }
        closePopup();
      };
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      const reposition = () => calculatePosition();
      window.addEventListener("scroll", reposition, true);
      window.addEventListener("resize", reposition);
      return () => {
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    /* ---------- KEYBOARD HANDLERS ---------- */

    const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;

      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) openPopup();
      }

      if (e.key === "Escape" && hasRange) {
        e.preventDefault();
        handleClear();
      }
    };

    const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!focusedDate || isMonthYearPickerOpen) return;

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
        case "Enter":
        case " ":
          e.preventDefault();
          if (!isDateDisabled(focusedDate)) handleDateClick(focusedDate);
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
      }
    };

    /* ---------- MONTH/YEAR PICKER HANDLERS ---------- */

    const handleMonthSelection = (month: string, isStart: boolean) => {
      const monthIndex = MONTHS_OPTIONS.findIndex(
        (option) => option.value === month,
      );
      if (isStart) {
        setLeftMonth(addMonths(leftMonth, monthIndex - leftMonth.getMonth()));
      } else {
        setRightMonth(
          addMonths(rightMonth, monthIndex - rightMonth.getMonth()),
        );
      }
    };

    const handleYearSelection = (year: string, isStart: boolean) => {
      const numericYear = parseInt(year, 10);
      const updatedYear = isStart
        ? new Date(numericYear, leftMonth.getMonth())
        : new Date(numericYear, rightMonth.getMonth());
      if (isStart) {
        setLeftMonth(updatedYear);
      } else {
        setRightMonth(updatedYear);
      }
    };

    const validPopupStyle: PopupStyle | undefined =
      hasCoords && popupStyle.width ? popupStyle : undefined;

    /* ---------- RENDER CALENDAR GRID ---------- */

    const renderCalendar = (month: Date, panel: "left" | "right") => {
      const days = getDaysInMonthList(month);

      return (
        <div className="flex-1 min-w-0">
          <div
            className="flex items-center justify-between mb-3 px-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Month Picker */}
            <div className="flex-1">
              <SimpleSelect
                options={[...MONTHS_OPTIONS]}
                value={MONTHS_OPTIONS[month.getMonth()].value}
                onChange={(m) => handleMonthSelection(m, panel === "left")}
                placeholder="Select a month"
                className="border-r-0"
              />
            </div>

            {/* Year Picker */}
            <div className="w-24">
              <SimpleSelect
                options={YEAR_OPTIONS}
                value={month.getFullYear().toString()}
                onChange={(y) => handleYearSelection(y, panel === "left")}
                placeholder="Select a year"
              />
            </div>
          </div>

          {/* Day names */}
          <div className={cn("grid grid-cols-7 gap-0 mb-1")}>
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className={cn(
                  "text-center text-xs font-medium py-1.5",
                  variant === "professional"
                    ? "text-gray-600"
                    : "text-slate-700",
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div
            className={`grid grid-cols-7 gap-0 gap-y-0.5 ${
              gridBox
                ? "border-t border-l border-border dark:border-darkBorder"
                : ""
            }`}
          >
            {days.map((date, idx) => {
              const isStart = date ? isRangeStart(date) : false;
              const isEnd = date ? isRangeEnd(date) : false;
              const inRange = date ? isInRange(date) : false;
              const inHover = date ? isInHoverRange(date) : false;
              const isTodayDate = date ? isToday(date) : false;
              const disabledDate = date ? isDateDisabled(date) : false;

              const dateStyles = date
                ? getDateStyles(
                    isStart,
                    isEnd,
                    inRange,
                    inHover,
                    isTodayDate,
                    disabledDate,
                  )
                : "";

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-center",
                    gridBox &&
                      "border-b border-r border-border dark:border-darkBorder",
                    variant === "professional" ? "h-8" : "h-10",
                  )}
                >
                  {date ? (
                    <button
                      type="button"
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                      disabled={disabledDate}
                      className={cn(
                        "text-xs transition-all cursor-pointer",
                        disabledDate && "opacity-50",
                        variant === "professional" ? "size-7" : "size-8",
                        dateStyles,
                      )}
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---------- POPUP CONTENT ---------- */

    const renderPopupContent = () => {
      if (variant === "professional") {
        return (
          <div className="w-[354px] sm:w-[500px] lg:w-[600px] max-w-[95vw] bg-white dark:bg-darkPrimary rounded-md border border-gray-200 dark:border-darkBorder shadow-md">
            <div id={gridId} className="flex min-h-84">
              {/* Shortcuts */}
              <div className="w-28 lg:w-32 shrink-0 py-3 border-r border-border dark:border-darkBorder relative">
                <div className="space-y-[3px] px-2 lg:px-3">
                  {QUICK_SHORTCUTS.map((shortcut) => {
                    const isCustom = shortcut.label === "Custom";
                    const isActive = activeShortcut === shortcut.label;

                    return (
                      <button
                        key={shortcut.label}
                        type="button"
                        disabled={
                          isCustom && (!dateRange.start || !dateRange.end)
                        }
                        onClick={() => {
                          if (isCustom) {
                            if (!dateRange.start || !dateRange.end) return;
                            setActiveShortcut("Custom");
                            return;
                          }
                          if (shortcut.getValue) {
                            handleShortcut(shortcut.label, shortcut.getValue);
                          }
                        }}
                        className={cn(
                          "w-full text-left px-2 lg:px-2.5 py-1.5 text-[11px] lg:text-xs font-medium rounded-sm transition-all cursor-pointer truncate",
                          isActive
                            ? isCustom
                              ? "bg-purple-600 text-white"
                              : "bg-primary text-white"
                            : isCustom && (!dateRange.start || !dateRange.end)
                              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3A3A3A]",
                        )}
                      >
                        {shortcut.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Month/Year Picker + Dual Calendar */}
                <div className="w-full overflow-hidden">
                  <div
                    className={cn(
                      "flex w-full transition-transform duration-500 ease-in-out",
                      isMonthYearPickerOpen
                        ? "-translate-x-full"
                        : "translate-x-0",
                    )}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-2 lg:pt-5 lg:p-4 flex-1 min-w-full">
                      {renderCalendar(leftMonth, "left")}
                      <div className="hidden lg:block">
                        {renderCalendar(rightMonth, "right")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-darkBorder flex lg:flex-row flex-col items-center justify-between gap-3 lg:gap-0">
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-start">
                    <div className="text-xs font-medium text-white bg-gray-400 dark:bg-darkBorder rounded px-3 py-1.5 whitespace-nowrap">
                      {getDaysCount()} days
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClear()}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkBorder transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        handleClear();
                        closePopup();
                      }}
                      className="flex-1 lg:flex-none px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkBorder transition-colors text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closePopup();
                        inputRef.current?.focus();
                      }}
                      className="flex-1 lg:flex-none px-4 py-1.5 text-xs font-medium text-white bg-primary hover:bg-green-600 rounded transition-colors text-center cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    };

    /* ---------- MAIN RENDER ---------- */

    return (
      <div className={cn("relative", fullWidth && "w-full", className)}>
        {label && (
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            id={headerId}
          >
            {label}
            {(requiredSign || required) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}

        <div ref={triggerRefc} className="relative flex items-center">
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            type="text"
            className={cn(
              "flex h-10 w-full rounded-md border border-border dark:border-darkBorder bg-background dark:bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              startIcon || (!startIcon && !readOnly && !disabled)
                ? "pl-10"
                : "pl-3",
              (endIcon || (showClearButton && hasRange)) && "pr-10",
              error && "border-red-500",
              inputClass,
            )}
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? popupId : undefined}
            aria-autocomplete="none"
            placeholder={placeholder}
            value={formatDateHeader()}
            onClick={() => !disabled && !readOnly && openPopup()}
            onKeyDown={onInputKeyDown}
            readOnly={true}
            disabled={disabled}
            required={required}
            {...props}
          />

          {startIcon ? (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 pointer-events-none"
              aria-hidden="true"
            >
              {startIcon}
            </div>
          ) : (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer"
              onClick={() => !disabled && !readOnly && openPopup()}
              aria-hidden="true"
            >
              <CalendarIcon className="h-4 w-4" />
            </div>
          )}

          {hasRange && showClearButton && !disabled && !readOnly ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer"
              onClick={(e) => handleClear(e)}
              aria-label="Clear date range"
            >
              <XIcon className="h-4 w-4" />
            </button>
          ) : (
            endIcon && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 pointer-events-none"
                aria-hidden="true"
              >
                {endIcon}
              </div>
            )
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
            {helperText}
          </p>
        )}

        {typeof document !== "undefined" &&
          isOpen &&
          validPopupStyle &&
          createPortal(
            <div
              ref={portalRefC}
              id={popupId}
              role="dialog"
              aria-modal={false}
              aria-labelledby={headerId}
              aria-describedby={gridId}
              data-placement={placement}
              style={validPopupStyle as React.CSSProperties}
              className={cn(
                "absolute -mt-0.5 z-50 bg-transparent border-none shadow-none transition-all duration-150 ease-in-out",
                isVisible && !disabled && !readOnly
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95",
              )}
              onKeyDown={onGridKeyDown}
            >
              {renderPopupContent()}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

HugeCalender.displayName = "HugeCalender";

export { HugeCalender };
