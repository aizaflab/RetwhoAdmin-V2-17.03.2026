"use client";

import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type JSX,
  useCallback,
} from "react";
import {
  format,
  parse,
  isValid,
  isToday,
  isSameDay,
  isBefore,
  isWithinInterval,
  addMonths,
  subMonths,
  startOfMonth,
  endOfDay,
  startOfDay,
  isAfter,
  setMonth,
  setYear,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XIcon,
} from "@/components/icons/Icons";
import SimpleSelect from "../select/SimpleSelect";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  className?: string;
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  placeholder?: string;
  format?: string;
  separator?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  showClearButton?: boolean;
  highlightToday?: boolean;
  allowManualInput?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  align?: string;
  endIcon?: JSX.Element;
  responsiveWidth?: number;
}

const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(
  (
    {
      className,
      value = { start: null, end: null },
      onChange,
      placeholder = "Select date range",
      format: dateFormat = "yyyy-MM-dd",
      separator = " - ",
      minDate,
      maxDate,
      disabled = false,
      readOnly = false,
      showClearButton = true,
      highlightToday = true,
      allowManualInput = true,
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      endIcon,
      responsiveWidth = 764,
      ...props
    },
    ref,
  ) => {
    const [dateRange, setDateRange] = useState<DateRange>({
      start: value.start,
      end: value.end,
    });
    const [inputValue, setInputValue] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [hasCoords, setHasCoords] = useState<boolean>(false);
    const [leftMonth, setLeftMonth] = useState<Date>(
      startOfMonth(value.start || new Date()),
    );
    const [rightMonth, setRightMonth] = useState<Date>(
      addMonths(startOfMonth(value.start || new Date()), 1),
    );
    const [selectingStart, setSelectingStart] = useState<boolean>(true);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    const calendarRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);

    const [dropdownStyle, setDropdownStyle] = useState<{
      top: number;
      left: string | number;
      right: string | number;
      width: number;
      position: "absolute" | "fixed";
      zIndex: number;
    }>({
      top: 0,
      left: 0,
      right: "auto",
      width: 0,
      position: "absolute",
      zIndex: 9999,
    });

    const getActualScrollY = useCallback((): number => {
      const bodyStyle = window.getComputedStyle(document.body);
      if (bodyStyle.position === "fixed") {
        const topValue = document.body.style.top;
        return topValue ? Math.abs(Number.parseInt(topValue, 10)) : 0;
      }
      return window.scrollY;
    }, []);

    const getCalendarWidth = useCallback(
      (isMobile: boolean): number => (isMobile ? 300 : 580),
      [],
    );

    const calculateDropdownPosition = useCallback(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const isInModal = !!triggerRef.current.closest('[role="dialog"]');
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const calendarWidth = getCalendarWidth(
        window.innerWidth < responsiveWidth,
      );
      const actualHeight = calendarRef.current?.offsetHeight;
      const estimatedCalendarHeight = actualHeight || 380;
      const spacing = 8;

      let top: number;
      let left: number | string;
      let right: number | string = "auto";
      const position: "absolute" | "fixed" = isInModal ? "fixed" : "absolute";
      const scrollY = getActualScrollY();
      // Try BOTTOM first
      const bottomPosition = isInModal
        ? rect.bottom + spacing
        : rect.bottom + scrollY + spacing;
      const spaceBelowViewport = viewportHeight - (rect.bottom + spacing);

      // Check if there's enough space below; if not and there's space above, use TOP
      if (spaceBelowViewport < estimatedCalendarHeight) {
        // Try TOP
        const topSpace = isInModal ? rect.top - spacing : rect.top - spacing;
        if (topSpace >= estimatedCalendarHeight) {
          // Use TOP
          top = isInModal
            ? rect.top - estimatedCalendarHeight - spacing
            : rect.top + scrollY - estimatedCalendarHeight - spacing;
        } else {
          // Not enough space above either, but prefer bottom anyway
          top = bottomPosition;
        }
      } else {
        // Enough space below, use BOTTOM
        top = bottomPosition;
      }

      // Horizontal positioning
      if (rect.left + calendarWidth > viewportWidth) {
        left = "auto";
        right = viewportWidth - rect.right;
      } else {
        left = isInModal ? rect.left : rect.left + window.scrollX;
        right = "auto";
      }

      setDropdownStyle({
        top,
        left,
        right,
        width: rect.width,
        position,
        zIndex: isInModal ? 10000 : 9999,
      });
      setHasCoords(true);
    }, [
      responsiveWidth,
      getCalendarWidth,
      getActualScrollY,
      setDropdownStyle,
      setHasCoords,
    ]);

    useEffect(() => {
      if (!isOpen || !calendarRef.current || !triggerRef.current) return;

      const adjust = () => {
        const rect = triggerRef.current!.getBoundingClientRect();
        const isInModal = !!triggerRef.current!.closest('[role="dialog"]');
        const popupEl = calendarRef.current!;
        const popupH = popupEl.offsetHeight;
        const viewportH = window.innerHeight;
        const spacing = 8;
        const scrollY = getActualScrollY();

        const belowSpace = viewportH - rect.bottom - spacing;
        const aboveSpace = rect.top - spacing;

        let newTop = dropdownStyle.top;

        // Prefer bottom; if not enough, flip to top
        if (belowSpace < popupH && aboveSpace >= popupH) {
          // Open upward
          if (isInModal) {
            newTop = rect.top - popupH - spacing;
          } else {
            newTop = rect.top + scrollY - popupH - spacing;
          }
        } else {
          // Keep bottom (or fall back if no space anywhere)
          if (isInModal) {
            newTop = rect.bottom + spacing;
          } else {
            newTop = rect.bottom + scrollY + spacing;
          }
        }

        setDropdownStyle((prev) => ({ ...prev, top: newTop }));
      };

      requestAnimationFrame(adjust);
    }, [isOpen, isVisible, getActualScrollY, dropdownStyle.top]);

    const openCalendar = useCallback(() => {
      if (disabled || readOnly) return;
      calculateDropdownPosition();
      setIsOpen(true);
      requestAnimationFrame(() => setIsVisible(true));
    }, [
      calculateDropdownPosition,
      disabled,
      readOnly,
      setIsOpen,
      setIsVisible,
    ]);

    const closeCalendar = useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIsOpen(false);
        setHasCoords(false);
        setSelectingStart(true);
        setDropdownStyle((s) => ({
          ...s,
          top: 0,
          left: 0,
          width: 0,
          right: "auto",
        }));
      }, 150);
    }, [
      setIsVisible,
      setIsOpen,
      setHasCoords,
      setSelectingStart,
      setDropdownStyle,
    ]);

    const handleDateHover = (date: Date) => {
      if (!selectingStart && dateRange.start) {
        setHoverDate(date);
      }
    };
    const handleMouseLeave = () => setHoverDate(null);

    useEffect(() => {
      const checkIsMobile = () =>
        setIsMobile(window.innerWidth < responsiveWidth);
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, [responsiveWidth]);

    const formatInputValue = useCallback(
      (range: DateRange) => {
        if (range.start && range.end) {
          return `${format(range.start, dateFormat)}${separator}${format(range.end, dateFormat)}`;
        } else if (range.start) {
          return `${format(range.start, dateFormat)}${separator}...`;
        }
        return "";
      },
      [dateFormat, separator],
    );

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        if (
          isOpen &&
          calendarRef.current &&
          !calendarRef.current.contains(target) &&
          !triggerRef.current?.contains(target)
        ) {
          closeCalendar();
        }
      };

      document.addEventListener(
        "mousedown",
        handleClickOutside as EventListener,
      );
      return () =>
        document.removeEventListener(
          "mousedown",
          handleClickOutside as EventListener,
        );
    }, [isOpen, closeCalendar]);

    useEffect(() => {
      if (!isOpen) return;
      window.addEventListener("scroll", calculateDropdownPosition, true);
      window.addEventListener("resize", calculateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", calculateDropdownPosition, true);
        window.removeEventListener("resize", calculateDropdownPosition);
      };
    }, [isOpen, calculateDropdownPosition]);

    const handleDateSelect = (date: Date) => {
      let newRange = { ...dateRange };

      if (
        selectingStart ||
        !dateRange.start ||
        (dateRange.start && dateRange.end)
      ) {
        newRange = { start: startOfDay(date), end: null };
        setSelectingStart(false);
      } else {
        if (isBefore(date, dateRange.start)) {
          newRange = {
            start: startOfDay(date),
            end: endOfDay(dateRange.start),
          };
        } else {
          newRange = { start: dateRange.start, end: endOfDay(date) };
        }
        setSelectingStart(true);
        closeCalendar();
      }

      setDateRange(newRange);
      setInputValue(formatInputValue(newRange));
      onChange?.(newRange);
      setHoverDate(null);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);
      if (!allowManualInput) return;

      const parts = v.split(separator).map((s) => s.trim());
      if (parts.length === 2) {
        try {
          const [startStr, endStr] = parts;
          const parsedStart = parse(startStr, dateFormat, new Date());
          const parsedEnd = parse(endStr, dateFormat, new Date());

          if (isValid(parsedStart) && isValid(parsedEnd)) {
            const newRange = {
              start: startOfDay(parsedStart),
              end: endOfDay(parsedEnd),
            };
            setDateRange(newRange);
            onChange?.(newRange);
          }
        } catch (e) {
          console.error("Error parsing date range:", e);
        }
      }
    };

    const handleInputBlur = () => {
      if (inputValue === "" || !dateRange.start) {
        const cleared = { start: null, end: null };
        setDateRange(cleared);
        onChange?.(cleared);
        setInputValue("");
        return;
      }
      setInputValue(formatInputValue(dateRange));
    };

    const handleClear = (e: ReactMouseEvent | MouseEvent) => {
      e?.stopPropagation?.();
      const cleared = { start: null, end: null };
      setDateRange(cleared);
      setInputValue("");
      setSelectingStart(true);
      onChange?.(cleared);
      closeCalendar();
    };

    const generateCalendarDays = (month: Date) => {
      const firstDayOfMonth = startOfMonth(month);
      const days = [];
      const startDay = firstDayOfMonth.getDay();

      for (let i = 0; i < startDay; i++) {
        days.push(null);
      }

      let day = firstDayOfMonth;
      while (day.getMonth() === month.getMonth()) {
        days.push(day);
        day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
      }

      return days;
    };

    const isDateDisabled = (date: Date) => {
      if (!date) return false;
      const d = startOfDay(date);
      if (minDate && isBefore(d, startOfDay(minDate))) return true;
      if (maxDate && isAfter(d, endOfDay(maxDate))) return true;
      return false;
    };

    const isInRange = (date: Date) => {
      if (!date || !dateRange.start || !dateRange.end) return false;
      return isWithinInterval(startOfDay(date), {
        start: startOfDay(dateRange.start),
        end: endOfDay(dateRange.end),
      });
    };

    const isRangeStart = (date: Date) =>
      !!date && !!dateRange.start && isSameDay(date, dateRange.start);
    const isRangeEnd = (date: Date) =>
      !!date && !!dateRange.end && isSameDay(date, dateRange.end);

    const isInHoverRange = (date: Date) => {
      if (!date || !dateRange.start || !hoverDate || selectingStart)
        return false;

      const dateStart = startOfDay(date);
      const rangeStart = startOfDay(dateRange.start);
      const hoverEnd = startOfDay(hoverDate);

      if (isBefore(hoverEnd, rangeStart)) {
        return isWithinInterval(dateStart, {
          start: hoverEnd,
          end: rangeStart,
        });
      }
      return isWithinInterval(dateStart, { start: rangeStart, end: hoverEnd });
    };

    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const monthsOptions = [
      { value: "0", label: "January" },
      { value: "1", label: "February" },
      { value: "2", label: "March" },
      { value: "3", label: "April" },
      { value: "4", label: "May" },
      { value: "5", label: "June" },
      { value: "6", label: "July" },
      { value: "7", label: "August" },
      { value: "8", label: "September" },
      { value: "9", label: "October" },
      { value: "10", label: "November" },
      { value: "11", label: "December" },
    ];

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 100 }, (_, i) => {
      const y = currentYear - 50 + i;
      return { value: String(y), label: String(y) };
    }).reverse();

    const handleMonthChange = (val: string, isLeft: boolean) => {
      const newMonthIndex = parseInt(val, 10);
      const targetDate = isLeft ? leftMonth : rightMonth;
      const newDate = setMonth(targetDate, newMonthIndex);

      if (isLeft) {
        setLeftMonth(newDate);
      } else {
        setRightMonth(newDate);
      }
    };

    const handleYearChange = (val: string, isLeft: boolean) => {
      const newYear = parseInt(val, 10);
      const targetDate = isLeft ? leftMonth : rightMonth;
      const newDate = setYear(targetDate, newYear);

      if (isLeft) {
        setLeftMonth(newDate);
      } else {
        setRightMonth(newDate);
      }
    };

    const renderCalendarMonth = (month: Date, isLeft: boolean) => (
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <button
            type="button"
            onClick={() =>
              isLeft
                ? setLeftMonth(subMonths(leftMonth, 1))
                : setRightMonth(subMonths(rightMonth, 1))
            }
            className="size-8 center bg-gray-100 rounded-md dark:bg-[#3d3d3d] cursor-pointer text-gray-600 dark:text-gray-300"
            aria-label="Previous Month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <div className="flex flex-1 gap-1">
            <div className="flex-1 min-w-[90px]">
              <SimpleSelect
                options={monthsOptions}
                value={String(month.getMonth())}
                onChange={(v) => handleMonthChange(v, isLeft)}
                placeholder="Month"
                className="h-8 border-border rounded-md
"
              />
            </div>
            <div className="w-[70px]">
              <SimpleSelect
                options={yearOptions}
                value={String(month.getFullYear())}
                onChange={(v) => handleYearChange(v, isLeft)}
                placeholder="Year"
                className="h-8 border-border rounded-md"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              isLeft
                ? setLeftMonth(addMonths(leftMonth, 1))
                : setRightMonth(addMonths(rightMonth, 1))
            }
            className="size-8 center bg-gray-100 rounded-md dark:bg-[#3d3d3d] cursor-pointer text-gray-600 dark:text-gray-300"
            aria-label="Next Month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {daysOfWeek.map((day) => (
            <div
              key={`${month.toISOString()}-${day}`}
              className="text-center text-xs font-medium text-gray-500 py-1 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays(month).map((date, index) => {
            const isTodayDate = date && highlightToday && isToday(date);
            const isDisabled = date && isDateDisabled(date);
            const isStart = date && isRangeStart(date);
            const isEnd = date && isRangeEnd(date);
            const inRange = date && isInRange(date);
            const inHoverRange = date && isInHoverRange(date);

            let classNameOverrides = "";
            if (isStart) {
              classNameOverrides =
                "bg-primary dark:bg-white dark:text-black text-white hover:bg-primary rounded-md ";
            } else if (isEnd) {
              classNameOverrides =
                "bg-primary dark:bg-white dark:text-black text-white hover:bg-primary/90 rounded-md ";
            } else if (inRange) {
              classNameOverrides = "bg-primary/10 text-primary rounded-md";
            } else if (inHoverRange) {
              classNameOverrides = "bg-primary/10 text-primary rounded-md";
            } else if (isTodayDate) {
              classNameOverrides =
                "border border-primary text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-[#3d3d3d] rounded-md cursor-pointer";
            }

            return (
              <div
                key={`${month.toISOString()}-${index}`}
                className="text-center"
              >
                {date ? (
                  <button
                    type="button"
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    onMouseEnter={() => !isDisabled && handleDateHover(date)}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                      "w-8 h-8 text-sm flex items-center justify-center transition-colors duration-100",
                      "rounded-full hover:bg-gray-100 dark:hover:bg-[#3d3d3d] cursor-pointer",
                      isDisabled &&
                        "text-gray-300 cursor-not-allowed  dark:text-[#7b7b7b] hover:bg-transparent dark:hover:bg-transparent",
                      classNameOverrides,
                      (isStart || isEnd) &&
                        "hover:bg-primary dark:hover:bg-white/90",
                    )}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className={cn("relative", fullWidth && "w-full", className)}>
        {label && (
          <label
            onClick={() => setIsVisible(false)}
            className="block text-sm font-medium text-[#3d3d3d] dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <div ref={triggerRef} className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {startIcon}
            </div>
          )}

          <div className="relative flex items-center">
            <input
              ref={(node) => {
                inputRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              type="text"
              className={cn(
                "flex h-[38px] w-full rounded-md border border-input bg-white dark:bg-transparent dark:border-[#3A3A3A] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                startIcon ? "pl-10" : "pl-3",
                endIcon ||
                  (showClearButton && inputValue && !disabled && !readOnly)
                  ? "pr-10"
                  : "pr-3",
                error && "border-red-500",
              )}
              placeholder={placeholder}
              value={inputValue}
              onChange={allowManualInput ? handleInputChange : undefined}
              onBlur={handleInputBlur}
              onClick={openCalendar}
              readOnly={!allowManualInput || readOnly}
              disabled={disabled}
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
                aria-hidden="true"
              >
                <CalendarIcon className="h-4 w-4" />
              </div>
            )}

            {inputValue && showClearButton && !disabled && !readOnly ? (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={handleClear}
              >
                <XIcon className="h-4 w-4" />
              </div>
            ) : (
              endIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {endIcon}
                </div>
              )
            )}
          </div>
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}

        {typeof document !== "undefined" &&
          isOpen &&
          hasCoords &&
          createPortal(
            <div
              ref={calendarRef}
              style={{
                top: dropdownStyle.top,
                left:
                  dropdownStyle.left !== "auto" ? dropdownStyle.left : "auto",
                right:
                  dropdownStyle.right !== "auto" ? dropdownStyle.right : "auto",
                width: isMobile ? 300 : 580,
                position: dropdownStyle.position,
                zIndex: dropdownStyle.zIndex,
              }}
              className={cn(
                "bg-white border border-gray-200 rounded-md shadow-lg p-3 dark:bg-[#272727] dark:border-[#3A3A3A] transition-all duration-150",
                isVisible && !disabled && !readOnly
                  ? "opacity-100 visible scale-100"
                  : "opacity-0 invisible scale-95",
              )}
            >
              {/* ... existing calendar header and content ... */}

              <div
                className={
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 gap-4"
                }
              >
                {renderCalendarMonth(leftMonth, true)}
                {!isMobile && renderCalendarMonth(rightMonth, false)}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-[#3d3d3d] dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear
                </button>

                <div className="text-sm font-medium text-[#3d3d3d] dark:text-gray-300">
                  {dateRange.start && (
                    <span>
                      {format(dateRange.start, dateFormat)}
                      {dateRange.end &&
                        ` - ${format(dateRange.end, dateFormat)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };
