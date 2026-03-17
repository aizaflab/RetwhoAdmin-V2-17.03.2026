"use client";

import type React from "react";

import {
  format,
  parse,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isValid,
  isToday,
  isSameDay,
  addDays,
} from "date-fns";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XIcon,
} from "@/components/icons/Icons";
import { createPortal } from "react-dom";
import SimpleSelect from "../select/SimpleSelect";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type ChangeEvent,
  type MouseEvent,
  type JSX,
  type KeyboardEvent,
  useId,
  useCallback,
} from "react";

interface CalendarProps {
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
  value?: string | Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  format?: string;
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
}

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

const MONTH_OPTIONS = [
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

// Generate year options (current year ± 50 years)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 101 }, (_, i) => {
  const year = currentYear - 50 + i;
  return { value: String(year), label: String(year) };
});

const Calendar = forwardRef<HTMLInputElement, CalendarProps>(
  (
    {
      className = "w-[280px]",
      value,
      onChange,
      placeholder = "Select date",
      format: dateFormat = "yyyy-MM-dd",
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
      ...props
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
      initialDate ? format(initialDate, dateFormat) : "",
    );
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
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

    const calculatePosition = useCallback(() => {
      const base = calculatePositionBase();
      if (!base) return;

      const { rect, left, position, isInModal } = base;
      // Use actual height if portal is rendered, otherwise use a more accurate estimate
      const actualHeight = portalRef.current?.offsetHeight;
      const popupHeight = actualHeight || (useSelectHeader ? 280 : 258);
      const spacing = 8;
      const viewportHeight = window.innerHeight;

      let topPosition: number;
      let decidedPlacement: Placement = "bottom";

      if (position === "fixed") {
        // Try bottom first
        const bottomPosition = rect.bottom + spacing;
        const spaceBelow = viewportHeight - bottomPosition;

        // If not enough space below, use top
        if (spaceBelow < popupHeight) {
          topPosition = rect.top - popupHeight - spacing;
          decidedPlacement = "top";
        } else {
          topPosition = bottomPosition;
          decidedPlacement = "bottom";
        }
      } else {
        const scrollY = getActualScrollY();
        // Try bottom first
        const bottomPosition = rect.bottom + scrollY + spacing;
        const spaceBelow = viewportHeight - (rect.bottom + spacing);

        // If not enough space below, use top
        if (spaceBelow < popupHeight) {
          topPosition = rect.top + scrollY - popupHeight - spacing;
          decidedPlacement = "top";
        } else {
          topPosition = bottomPosition;
          decidedPlacement = "bottom";
        }
      }

      setPopupStyle({
        top: topPosition,
        left,
        width: rect.width || 280,
        position,
        zIndex: isInModal ? 10000 : 9999,
      });
      setPlacement(decidedPlacement);
      setHasCoords(true);
    }, [calculatePositionBase, useSelectHeader]);

    useEffect(() => {
      if (!isOpen || !portalRef.current || !triggerRef.current) return;

      const popupEl = portalRef.current;
      const base = calculatePositionBase();
      if (!base) return;

      const { rect, left, position, isInModal } = base;
      const popupH = popupEl.offsetHeight;
      const spacing = 8;
      const viewportHeight = window.innerHeight;

      let topPosition: number;
      if (position === "fixed") {
        const bottomPosition = rect.bottom + spacing;
        const spaceBelow = viewportHeight - bottomPosition;

        if (spaceBelow < popupH) {
          topPosition = rect.top - popupH - spacing;
        } else {
          topPosition = bottomPosition;
        }
      } else {
        const scrollY = getActualScrollY();
        const bottomPosition = rect.bottom + scrollY + spacing;
        const spaceBelow = viewportHeight - (rect.bottom + spacing);

        if (spaceBelow < popupH) {
          topPosition = rect.top + scrollY - popupH - spacing;
        } else {
          topPosition = bottomPosition;
        }
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPopupStyle({
        top: topPosition,
        left,
        width: rect.width || popupEl.offsetWidth || 280,
        position,
        zIndex: isInModal ? 10000 : 9999,
      });
    }, [isOpen, isVisible, calculatePositionBase, placement]);

    const openPopup = () => {
      if (disabled || readOnly) return;
      calculatePosition();
      setIsOpen(true);
      requestAnimationFrame(() => setIsVisible(true));

      const baseDate = selectedDate ?? new Date();
      setFocusedDate(baseDate);
      setCurrentMonth(baseDate);
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
      const handler = () => calculatePosition();
      window.addEventListener("scroll", handler, true);
      window.addEventListener("resize", handler);
      return () => {
        window.removeEventListener("scroll", handler, true);
        window.removeEventListener("resize", handler);
      };
    }, [isOpen, calculatePosition]);

    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      setFocusedDate(date);
      setInputValue(format(date, dateFormat));
      closePopup();
      onChange?.(date);
      inputRef.current?.focus();
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);

      if (!allowManualInput) return;

      try {
        const parsedDate = parse(v, dateFormat, new Date());
        if (isValid(parsedDate)) {
          setSelectedDate(parsedDate);
          setFocusedDate(parsedDate);
          onChange?.(parsedDate);
          setCurrentMonth(parsedDate);
        }
      } catch {
        /* ignore invalid input during typing */
      }
    };

    const handleInputBlur = () => {
      if (inputValue === "") {
        setSelectedDate(null);
        setFocusedDate(new Date());
        onChange?.(null);
        return;
      }
      try {
        const parsed = parse(inputValue, dateFormat, new Date());
        if (isValid(parsed)) {
          setSelectedDate(parsed);
          setFocusedDate(parsed);
          setInputValue(format(parsed, dateFormat));
          onChange?.(parsed);
        } else {
          setInputValue(selectedDate ? format(selectedDate, dateFormat) : "");
        }
      } catch {
        setInputValue(selectedDate ? format(selectedDate, dateFormat) : "");
      }
    };

    const handleClear = (e: MouseEvent) => {
      e?.stopPropagation?.();
      setSelectedDate(null);
      setFocusedDate(new Date());
      setInputValue("");
      onChange?.(null);
      inputRef.current?.focus();
    };

    const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
    const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
    const prevYear = () => setCurrentMonth((m) => subYears(m, 1));
    const nextYear = () => setCurrentMonth((m) => addYears(m, 1));

    const handleMonthChange = (value: string) => {
      const newMonth = new Date(currentMonth.getFullYear(), parseInt(value), 1);
      setCurrentMonth(newMonth);
    };

    const handleYearChange = (value: string) => {
      const newMonth = new Date(parseInt(value), currentMonth.getMonth(), 1);
      setCurrentMonth(newMonth);
    };

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
      const newMonth = new Date(pickerYear, pickerMonth, 1);
      setCurrentMonth(newMonth);
      setIsMonthYearPickerOpen(false);
    };

    const renderMonthYearPicker = () => {
      const currentYear = new Date().getFullYear();
      const years = Array.from(
        { length: 100 },
        (_, i) => currentYear - 50 + i,
      ).reverse();

      return (
        <div className="flex flex-col h-[236px] w-full">
          <div className="flex flex-1 gap-2 min-h-0 overflow-hidden">
            {/* Years List */}
            <div className="w-20 pr-1 overflow-y-auto sideBar">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setPickerYear(year)}
                  className={cn(
                    "w-full text-xs py-1.5 px-2 text-center rounded mb-1 cursor-pointer transition-colors",
                    pickerYear === year
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                  )}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Month Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 p-1">
                {MONTH_LABELS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPickerMonth(index)}
                    className={cn(
                      "text-xs py-2 rounded text-center cursor-pointer transition-colors border",
                      pickerMonth === index
                        ? "bg-primary text-white border-primary"
                        : "bg-transparent text-gray-700 border-transparent hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-2 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <button
              type="button"
              onClick={() => setIsMonthYearPickerOpen(false)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyMonthYearSelection}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors cursor-pointer"
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
        case "Home": {
          const start = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1,
          );
          next = start;
          break;
        }
        case "End": {
          const end = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0,
          );
          next = end;
          break;
        }
        case "PageUp":
          if (e.shiftKey) setCurrentMonth((m) => subYears(m, 1));
          else setCurrentMonth((m) => subMonths(m, 1));
          next = focusedDate;
          break;
        case "PageDown":
          if (e.shiftKey) setCurrentMonth((m) => addYears(m, 1));
          else setCurrentMonth((m) => addMonths(m, 1));
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

    const isTabbable = (date: Date) => {
      if (!focusedDate) return false;
      return isSameDay(date, focusedDate);
    };

    const getDayAriaLabel = (date: Date) => {
      const parts = format(date, "PPPP");
      const extra =
        (selectedDate && isSameDay(date, selectedDate) ? " Selected." : "") +
        (isToday(date) ? " Today." : "") +
        (isDateDisabled(date) ? " Unavailable." : "");
      return `${parts}.${extra}`.trim();
    };

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

        <div ref={triggerRef} className="relative flex items-center">
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
              "flex h-10 w-full rounded-md border border-border dark:border-[#3a3a3a] bg-background dark:bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              startIcon || (!startIcon && !readOnly && !disabled)
                ? "pl-10"
                : "pl-3",
              (endIcon || (showClearButton && inputValue)) && "pr-10",
              error && "border-red-500",
              inputClass,
            )}
            role="combobox"
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

          {inputValue && showClearButton && !disabled && !readOnly ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer"
              onClick={handleClear}
              aria-label="Clear date"
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
              ref={portalRef}
              id={popupId}
              role="dialog"
              aria-modal="false"
              aria-labelledby={headerId}
              aria-describedby={gridId}
              data-placement={placement}
              style={validPopupStyle}
              className={cn(
                "absolute -mt-0.5 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 dark:border-[#424242] dark:bg-[#292929] transition-all duration-150 ease-in-out min-w-[280px] max-w-[280px]",
                isVisible && !disabled && !readOnly
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95",
              )}
              onKeyDown={onGridKeyDown}
            >
              {isMonthYearPickerOpen ? (
                renderMonthYearPicker()
              ) : (
                <>
                  {useSelectHeader ? (
                    // Select Header Version
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="size-8 center bg-gray-100 rounded-md dark:bg-[#3d3d3d] cursor-pointer text-gray-600 dark:text-gray-300"
                        aria-label="Previous Month"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>

                      <div className="flex flex-1 gap-1">
                        <div className="flex-1 w-[80px]">
                          <SimpleSelect
                            options={MONTH_OPTIONS}
                            value={String(currentMonth.getMonth())}
                            onChange={handleMonthChange}
                            placeholder="Month"
                            className="h-8 border-border rounded-md"
                          />
                        </div>
                        <div className="w-[70px]">
                          <SimpleSelect
                            options={YEAR_OPTIONS}
                            value={String(currentMonth.getFullYear())}
                            onChange={handleYearChange}
                            placeholder="Year"
                            className="h-8 border-border rounded-md"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={nextMonth}
                        className="size-8 center bg-gray-100 rounded-md dark:bg-[#3d3d3d] cursor-pointer text-gray-600 dark:text-gray-300"
                        aria-label="Next Month"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // Traditional Header Version
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={prevYear}
                          className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-[#3d3d3d] cursor-pointer"
                          aria-label="Previous year"
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={prevMonth}
                          className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-[#3d3d3d] cursor-pointer"
                          aria-label="Previous month"
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div
                        id={headerId}
                        className="text-sm font-medium select-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3d3d3d] rounded px-2 py-0.5 transition-colors"
                        onClick={openMonthYearPicker}
                      >
                        {format(currentMonth, "MMMM yyyy")}
                      </div>

                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={nextMonth}
                          className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-[#3d3d3d] cursor-pointer"
                          aria-label="Next month"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={nextYear}
                          className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-[#3d3d3d] cursor-pointer"
                          aria-label="Next year"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className="grid grid-cols-7 gap-1 mb-1"
                    role="row"
                    aria-hidden="true"
                  >
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 py-1 dark:text-gray-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div
                    id={gridId}
                    role="grid"
                    aria-label={format(currentMonth, "MMMM yyyy")}
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
                              !isDateDisabled(date) && handleDateSelect(date)
                            }
                            className={cn(
                              "w-8 h-8 rounded-full text-sm cursor-pointer flex items-center justify-center",
                              isDateDisabled(date) &&
                                "text-gray-300 cursor-not-allowed dark:text-[#676767]",
                              !isDateDisabled(date) &&
                                "hover:bg-gray-100 dark:hover:bg-[#3d3d3d]",
                              selectedDate &&
                                isSameDay(date, selectedDate) &&
                                "bg-primary dark:bg-white dark:text-black text-white hover:bg-primary/90 dark:hover:bg-white/70",
                              highlightToday &&
                                isToday(date) &&
                                (!selectedDate ||
                                  !isSameDay(date, selectedDate)) &&
                                "border border-primary text-primary dark:text-white",
                            )}
                            disabled={isDateDisabled(date)}
                          >
                            {date.getDate()}
                          </button>
                        ) : (
                          <div className="w-8 h-8" aria-hidden="true" />
                        )}
                      </div>
                    ))}
                  </div>

                  {showTodayButton && (
                    <div className="text-center mt-2">
                      <button
                        type="button"
                        onClick={goToToday}
                        className="text-xs text-primary hover:underline cursor-pointer"
                        aria-label="Select today"
                      >
                        Today
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

Calendar.displayName = "Calendar";

export { Calendar };
