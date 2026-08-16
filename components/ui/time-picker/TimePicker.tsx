"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";
import { ClockIcon, XIcon } from "@/components/icons/Icons";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface TimePickerProps {
  /** Value in 24-hour `HH:mm` form — same shape a native time input produces. */
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show a 12-hour trigger + AM/PM column. Values stay `HH:mm` either way. */
  use12Hour?: boolean;
  /** Granularity of the minutes column. */
  minuteStep?: number;
  showClearButton?: boolean;
  error?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

type Period = "AM" | "PM";

interface TimeParts {
  hour24: number;
  minute: number;
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");

/** Parses `HH:mm`; returns null for empty or malformed input. */
function parseTime(value: string | undefined): TimeParts | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (hour24 > 23 || minute > 59) return null;
  return { hour24, minute };
}

const toPeriod = (hour24: number): Period => (hour24 < 12 ? "AM" : "PM");

/** 24-hour clock → the hour shown on a 12-hour dial (0 and 12 both read as 12). */
const to12Hour = (hour24: number): number => hour24 % 12 || 12;

const to24Hour = (hour12: number, period: Period): number =>
  period === "AM" ? hour12 % 12 : (hour12 % 12) + 12;

function formatDisplay(parts: TimeParts, use12Hour: boolean): string {
  if (!use12Hour) return `${pad(parts.hour24)}:${pad(parts.minute)}`;
  return `${pad(to12Hour(parts.hour24))}:${pad(parts.minute)} ${toPeriod(parts.hour24)}`;
}

/* -------------------------------------------------------------------------- */
/*                                  COLUMN                                    */
/* -------------------------------------------------------------------------- */

interface ColumnProps<T extends string | number> {
  label: string;
  items: T[];
  selected: T | null;
  /** The popup stays mounted for its transition, so re-center on each open. */
  isOpen: boolean;
  format?: (item: T) => string;
  onSelect: (item: T) => void;
}

function Column<T extends string | number>({
  label,
  items,
  selected,
  isOpen,
  format,
  onSelect,
}: ColumnProps<T>) {
  const listRef = useRef<HTMLDivElement | null>(null);

  // Centre the active row whenever the popup opens, so a 3 PM value doesn't
  // appear scrolled to midnight. Sets `scrollTop` directly rather than calling
  // `scrollIntoView`, which would also scroll the page behind the popup.
  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[data-selected="true"]');
    if (!list || !active) return;
    list.scrollTop =
      active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
  }, [isOpen, selected]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="px-1 pb-1 text-center text-2xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="select-scrollbar max-h-44 space-y-0.5 overflow-y-auto pr-1"
      >
        {items.map((item) => {
          const isSelected = selected === item;
          return (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={isSelected}
              data-selected={isSelected}
              onClick={() => onSelect(item)}
              className={cn(
                "w-full rounded-sm px-2 py-1.5 text-center text-sm tabular-nums transition-colors",
                "cursor-pointer focus-visible:ring focus-visible:ring-ring focus-visible:outline-none",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/90 hover:bg-muted",
              )}
            >
              {format ? format(item) : item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

/**
 * Column-based time picker — hour / minute / period lists in a popup, so the
 * value is picked by tapping rather than typed into a native `<input
 * type="time">` spinner. Emits 24-hour `HH:mm` strings.
 */
function TimePicker({
  value,
  onValueChange,
  placeholder = "Select time",
  disabled = false,
  use12Hour = true,
  minuteStep = 5,
  showClearButton = true,
  error = false,
  id,
  className,
  "aria-label": ariaLabel,
}: TimePickerProps) {
  const generatedId = useId();
  const triggerId = id ?? `time-${generatedId}`;
  const popupId = `${triggerId}-popup`;

  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const parts = parseTime(value);

  const hours = useMemo(
    () =>
      use12Hour
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : Array.from({ length: 24 }, (_, i) => i),
    [use12Hour],
  );

  const minutes = useMemo(() => {
    const step = Math.min(Math.max(minuteStep, 1), 60);
    return Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);
  }, [minuteStep]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  /** Writes a new value, filling in the untouched halves with sane defaults. */
  const commit = (next: Partial<TimeParts & { period: Period }>) => {
    const base = parts ?? { hour24: use12Hour ? 9 : 0, minute: 0 };
    const period = next.period ?? toPeriod(base.hour24);
    const hour24 =
      next.hour24 !== undefined
        ? next.hour24
        : next.period
          ? to24Hour(to12Hour(base.hour24), period)
          : base.hour24;
    const minute = next.minute ?? base.minute;
    onValueChange?.(`${pad(hour24)}:${pad(minute)}`);
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      close();
      return;
    }
    if (
      !isOpen &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.preventDefault();
          close();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popupId : undefined}
        // `aria-invalid` isn't supported on role=button — expose the state for
        // styling/tests instead.
        data-invalid={error || undefined}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-border bg-background",
          "py-2 pr-10 pl-10 text-left text-sm transition-colors",
          "cursor-pointer focus-visible:ring focus-visible:ring-ring focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      >
        <span
          className={cn(
            "truncate",
            parts ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {parts ? formatDisplay(parts, use12Hour) : placeholder}
        </span>
      </button>

      <span
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      >
        <ClockIcon className="h-4 w-4" />
      </span>

      {parts && showClearButton && !disabled && (
        <button
          type="button"
          onClick={() => onValueChange?.("")}
          aria-label="Clear time"
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}

      <div
        id={popupId}
        role="dialog"
        aria-label="Choose a time"
        className={cn(
          "absolute right-0 left-0 z-50 mt-2 origin-top rounded-md border border-border",
          "bg-card p-2 text-card-foreground shadow-lg transition-all duration-200",
          isOpen
            ? "visible scale-100 opacity-100"
            : "pointer-events-none invisible scale-95 opacity-0",
        )}
      >
        <div className="flex gap-1">
          <Column
            label={use12Hour ? "Hour" : "Hr (24)"}
            isOpen={isOpen}
            items={hours}
            selected={
              parts ? (use12Hour ? to12Hour(parts.hour24) : parts.hour24) : null
            }
            format={pad}
            onSelect={(hour) =>
              commit({
                hour24: use12Hour
                  ? to24Hour(hour, parts ? toPeriod(parts.hour24) : "AM")
                  : hour,
              })
            }
          />
          <Column
            label="Min"
            isOpen={isOpen}
            items={minutes}
            selected={parts?.minute ?? null}
            format={pad}
            onSelect={(minute) => commit({ minute })}
          />
          {use12Hour && (
            <Column<Period>
              label="AM/PM"
              isOpen={isOpen}
              items={["AM", "PM"]}
              selected={parts ? toPeriod(parts.hour24) : null}
              onSelect={(period) => commit({ period })}
            />
          )}
        </div>

        <div className="mt-2 flex justify-end border-t border-border pt-2">
          <button
            type="button"
            onClick={close}
            className="rounded-sm px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-muted"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

TimePicker.displayName = "TimePicker";

export { TimePicker };
