/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import {
  JSX,
  useId,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useCallback,
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

import { cn } from "@/lib/utils";
import type React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XIcon,
} from "@/components/icons/Icons";
import { createPortal } from "react-dom";
import { Checkbox } from "../checkbox/Checkbox";
import SimpleSelect from "../select/SimpleSelect";
import { TimeRangePicker } from "../input/NumberInput";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

type Placement = "bottom" | "top";
type AMPM = "AM" | "PM";

interface PopupStyle {
  top: number;
  left: number;
  width: number;
  position: "absolute" | "fixed";
  zIndex: number;
}

interface HugeCalenderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  disabled?: boolean;
  readOnly?: boolean;
  showClearButton?: boolean;
  highlightToday?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  inputClass?: string;
  requiredSign?: boolean;
  required?: boolean;
  endIcon?: JSX.Element;
  variant?: "professional";
  dateDesignStyle?: "minimal" | "box";
  dateShape?: string;
  gridBox?: boolean;
}

type QuickShortcut = {
  label: string;
  getValue?: () => DateRange;
};

const QUICK_SHORTCUTS: QuickShortcut[] = [
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
  {
    label: "Custom",
  },
];

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
      inputClass = "sm:w-[355px] w-[270px]",
      requiredSign = false,
      gridBox = false,
      required,
      endIcon,
      variant = "professional",
      dateDesignStyle = "minimal",
      dateShape = "",
      ...props
    },
    ref,
  ) => {
    /* ---------- RANGE STATE ---------- */
    const [dateRange, setDateRange] = useState<DateRange>(value);
    const [selectingStart, setSelectingStart] = useState(true);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

    /* ---------- TIME STATE ---------- */
    const [showTime, setShowTime] = useState(true);
    const [startHour, setStartHour] = useState("12");
    const [startMin, setStartMin] = useState("00");
    const [startPeriod, setStartPeriod] = useState<AMPM>("AM");
    const [endHour, setEndHour] = useState("11");
    const [endMin, setEndMin] = useState("59");
    const [endPeriod, setEndPeriod] = useState<AMPM>("PM");

    /* ---------- CALENDAR NAV & FOCUS ---------- */
    const baseInitialMonth = startOfMonth(
      dateRange.start || dateRange.end || new Date(),
    );

    const [leftMonth, setLeftMonth] = useState<Date>(baseInitialMonth);
    const [rightMonth, setRightMonth] = useState<Date>(
      addMonths(baseInitialMonth, 1),
    );

    const [focusedDate, setFocusedDate] = useState<Date | null>(
      dateRange.start || dateRange.end || new Date(),
    );

    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const mobileDaysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

    /* ---------- MONTH/YEAR PICKER STATE ---------- */
    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);

    /* ---------- POPUP / POSITION ---------- */
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasCoords, setHasCoords] = useState(false);
    const [placement, setPlacement] = useState<Placement>("bottom");
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

    const getActualScrollY = () => {
      if (typeof window === "undefined") return 0;
      const bodyStyle = window.getComputedStyle(document.body);
      if (bodyStyle.position === "fixed") {
        const topValue = document.body.style.top;
        return topValue ? Math.abs(Number.parseInt(topValue, 10)) : 0;
      }
      return window.scrollY;
    };

    const calculatePositionBase = useCallback((): {
      rect: DOMRect;
      left: number;
      position: "absolute" | "fixed";
      isInModal: boolean;
    } | null => {
      if (!triggerRefc.current || typeof window === "undefined") return null;
      const rect = triggerRefc.current.getBoundingClientRect();
      const isInModal = !!triggerRefc.current.closest('[role="dialog"]');

      const left = rect.left;
      const position: "absolute" | "fixed" = isInModal ? "fixed" : "absolute";

      return { rect, left, position, isInModal };
    }, []);

    const calculatePosition = useCallback(() => {
      const base = calculatePositionBase();
      if (!base || typeof window === "undefined") return;

      const { rect, left, position, isInModal } = base;
      const spacing = 8;

      const isMobile = window.innerWidth < 768;
      const popupWidth = isMobile ? Math.min(window.innerWidth - 20, 340) : 660;

      let topPosition: number;
      if (position === "fixed") {
        topPosition = rect.bottom + spacing;
      } else {
        const scrollY = getActualScrollY();
        topPosition = rect.bottom + scrollY + spacing;
      }

      let adjustedLeft = left;
      if (left + popupWidth > window.innerWidth) {
        adjustedLeft = window.innerWidth - popupWidth - 10;
      }
      if (adjustedLeft < 10) adjustedLeft = 10;

      setPopupStyle({
        top: topPosition,
        left: adjustedLeft,
        width: popupWidth,
        position,
        zIndex: isInModal ? 10000 : 9999,
      });

      setPlacement("bottom");
      setHasCoords(true);
    }, [calculatePositionBase]);

    const openPopup = () => {
      if (disabled || readOnly) return;
      calculatePosition();
      setIsOpen(true);
      requestAnimationFrame(() => setIsVisible(true));

      const baseDate = dateRange.start || dateRange.end || new Date();
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

    const isDateDisabled = (date: Date) => {
      if (!date) return false;
      if (minDate && date < startOfDay(minDate)) return true;
      if (maxDate && date > endOfDay(maxDate)) return true;
      return false;
    };

    const getDaysInMonthList = (date: Date) => {
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

    const getDaysCount = () => {
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

    const formatDateHeader = () => {
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
      return placeholder;
    };

    const hasRange = !!(dateRange.start || dateRange.end);

    const getDateStyles = (
      isStart: boolean,
      isEnd: boolean,
      inRange: boolean,
      inHover: boolean,
      isTodayDate: boolean,
      disabledDate: boolean,
    ) => {
      const shapeClass = dateShape || "rounded-md";

      if (disabledDate) {
        return `${shapeClass} text-gray-300 dark:text-[#676767] cursor-not-allowed`;
      }

      const inFullRange = inRange || inHover;

      if (dateDesignStyle === "box") {
        if (isStart || isEnd) {
          return `${shapeClass} bg-blue-600 dark:bg-white dark:text-black text-white border border-blue-600 dark:border-white font-semibold`;
        }
        if (inFullRange) {
          return `${shapeClass} bg-blue-100 dark:bg-[#3d3d3d] text-blue-900 dark:text-white border border-blue-300 dark:border-[#424242]`;
        }
        if (highlightToday && isTodayDate) {
          return `${shapeClass} border border-blue-500 dark:border-white text-blue-600 dark:text-white bg-white dark:bg-[#292929] font-semibold`;
        }
        return `${shapeClass} border border-gray-200 dark:border-[#424242] text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#3d3d3d]`;
      }

      // minimal
      if (isStart || isEnd) {
        return `${shapeClass} bg-blue-600 dark:bg-white dark:text-black text-white font-semibold`;
      }
      if (inFullRange) {
        return `${shapeClass} bg-blue-100 dark:bg-[#3d3d3d] text-blue-900 dark:text-white`;
      }
      if (highlightToday && isTodayDate) {
        return `${shapeClass} text-blue-600 dark:text-white border border-blue-500 dark:border-white font-semibold`;
      }
      return `${shapeClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3d3d3d]`;
    };

    const handleDateClick = (date: Date) => {
      if (isDateDisabled(date)) return;

      let newRange = { ...dateRange };

      if (
        selectingStart ||
        !dateRange.start ||
        (dateRange.start && dateRange.end)
      ) {
        newRange = { start: date, end: null };
        setSelectingStart(false);
        setActiveShortcut(null);
      } else {
        if (date < dateRange.start) {
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

    const handleClear = (e?: MouseEvent | KeyboardEvent) => {
      e?.stopPropagation?.();
      const emptyRange = { start: null, end: null };
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
      const handleOutside = (e: globalThis.MouseEvent) => {
        if (
          portalRefC.current &&
          (portalRefC.current.contains(e.target as Node) ||
            triggerRefc.current?.contains(e.target as Node))
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
    }, [isOpen, calculatePosition]);

    /* ---------- KEYBOARD HANDLERS ---------- */

    const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;

      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) openPopup();
      }

      if (e.key === "Escape" && hasRange) {
        e.preventDefault();
        handleClear(e);
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

    const monthsOptions = [
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
    ];

    const yearOptions = Array.from({ length: 100 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: year.toString(), label: year.toString() };
    });

    // Handle Month Selection for start or end calendar
    const handleMonthSelection = (month: string, isStart: boolean) => {
      const monthIndex = monthsOptions.findIndex(
        (option) => option.value === month,
      );
      const updatedMonth = isStart
        ? setLeftMonth(addMonths(leftMonth, monthIndex - leftMonth.getMonth()))
        : setRightMonth(
            addMonths(rightMonth, monthIndex - rightMonth.getMonth()),
          );
    };

    // Handle Year Selection for start or end calendar
    const handleYearSelection = (year: string, isStart: boolean) => {
      const numericYear = parseInt(year, 10);
      const updatedYear = isStart
        ? new Date(numericYear, leftMonth.getMonth())
        : new Date(numericYear, rightMonth.getMonth());
      isStart ? setLeftMonth(updatedYear) : setRightMonth(updatedYear);
    };

    const validPopupStyle =
      hasCoords && popupStyle.width > 0 ? popupStyle : undefined;

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
            <div className="flex-1 min-w-0">
              <SimpleSelect
                options={monthsOptions}
                value={monthsOptions[month.getMonth()].value}
                onChange={(month) =>
                  handleMonthSelection(month, panel === "left")
                }
                placeholder="Month"
                className="border-r-0 dark:border-[#3d3d3d] text-[10px] sm:text-xs h-7 sm:h-8"
              />
            </div>

            {/* Year Picker */}
            <div className="w-[60px] sm:w-24 shrink-0">
              <SimpleSelect
                options={yearOptions}
                value={month.getFullYear().toString()}
                onChange={(year) => handleYearSelection(year, panel === "left")}
                placeholder="Year"
                className="dark:border-[#3d3d3d] text-[10px] sm:text-xs h-7 sm:h-8"
              />
            </div>
          </div>

          {/* Day names */}
          <div className={cn("grid grid-cols-7 gap-0 mb-1")}>
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className={cn(
                  "text-center text-xs font-medium py-1.5",
                  variant === "professional"
                    ? "text-gray-600 dark:text-[#676767]"
                    : "text-slate-700 dark:text-gray-400",
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div
            className={`grid grid-cols-7 gap-0 gap-y-0.5 ${gridBox ? "border-t border-l border-border" : ""}`}
          >
            {days.map((date, idx) => {
              const isStart = date && isRangeStart(date);
              const isEnd = date && isRangeEnd(date);
              const inRange = date && isInRange(date);
              const inHover = date && isInHoverRange(date);
              const isTodayDate = date && isToday(date);
              const disabledDate = date ? isDateDisabled(date) : false;

              const dateStyles = date
                ? getDateStyles(
                    !!isStart,
                    !!isEnd,
                    !!inRange,
                    !!inHover,
                    !!isTodayDate,
                    disabledDate,
                  )
                : "";

              return (
                <div
                  key={idx}
                  className={cn(
                    " flex items-center justify-center",
                    gridBox &&
                      "border-b border-r border-border dark:border-[#424242]",
                    variant === "professional" ? "h-8" : "h-10",
                  )}
                >
                  {date ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleDateClick(date);
                      }}
                      onMouseEnter={() => {
                        setHoverDate(date);
                      }}
                      onMouseLeave={() => setHoverDate(null)}
                      disabled={disabledDate}
                      className={cn(
                        " text-xs transition-all cursor-pointer",
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
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div id={gridId} className="flex min-h-[300px]">
              {/* Shortcuts Sidebar (Remains on left) */}
              <div className="w-20 sm:w-32 shrink-0 py-4 border-r border-border flex flex-col justify-between bg-muted/30">
                <div className="space-y-1 px-1 sm:px-3">
                  <div className="px-1 mb-2">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                      Presets
                    </span>
                  </div>
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
                          "w-full text-left px-2 py-1.5 text-[10px] sm:text-xs font-semibold rounded-sm transition-all cursor-pointer",
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {shortcut.label}
                      </button>
                    );
                  })}
                </div>

                <div className="px-2 sm:px-3 border-t border-border pt-3 mt-auto sm:bock hidden">
                  <label className="flex items-center gap-1.5 cursor-pointer py-1 px-1 rounded hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={showTime}
                      onChange={(e) => setShowTime(e.target.checked)}
                      size="sm"
                    />
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      Time
                    </span>
                  </label>
                </div>
              </div>

              {/* Calendar Area */}
              <div className="flex-1 flex flex-col bg-background min-w-0">
                {showTime && (
                  <TimeRangePicker
                    startHour={startHour}
                    startMin={startMin}
                    startPeriod={startPeriod}
                    endHour={endHour}
                    endMin={endMin}
                    endPeriod={endPeriod}
                    onChangeStartHour={setStartHour}
                    onChangeStartMin={setStartMin}
                    onChangeStartPeriod={(v) => setStartPeriod(v)}
                    onChangeEndHour={setEndHour}
                    onChangeEndMin={setEndMin}
                    onChangeEndPeriod={(v) => setEndPeriod(v)}
                  />
                )}

                <div className="w-full overflow-hidden">
                  <div
                    className={cn(
                      "flex w-full transition-transform duration-500",
                      isMonthYearPickerOpen
                        ? "-translate-x-full"
                        : "translate-x-0",
                    )}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 flex-1 min-w-full max-h-[60vh] lg:max-h-none overflow-y-auto lg:overflow-y-visible">
                      {renderCalendar(leftMonth, "left")}
                      <div className="hidden lg:block">
                        {renderCalendar(rightMonth, "right")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-3 sm:px-4 py-2.5 border-t border-border flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] sm:text-[10px] font-bold">
                      {getDaysCount()} DAYS
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClear()}
                      className="text-[9px] sm:text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleClear();
                        closePopup();
                      }}
                      className="px-2.5 py-1.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closePopup();
                        inputRef.current?.focus();
                      }}
                      className="px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-all cursor-pointer uppercase"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              else if (ref)
                (
                  ref as React.MutableRefObject<HTMLInputElement | null>
                ).current = node;
            }}
            type="text"
            className={cn(
              "flex h-10 w-full rounded-md border border-border dark:border-[#3a3a3a] bg-background dark:bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
              aria-modal="false"
              aria-labelledby={headerId}
              aria-describedby={gridId}
              data-placement={placement}
              style={validPopupStyle}
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
