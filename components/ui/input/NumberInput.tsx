"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/components/icons/Icons";

type AMPM = "AM" | "PM";

/* ---------------- NumberInput (TS) ---------------- */

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder,
}) => {
  const handleInputChange = (v: string) => {
    // allow empty while typing
    if (v === "") {
      onChange("");
      return;
    }
    const num = Number.parseInt(v);
    if (Number.isNaN(num)) return;
    if (num < min || num > max) return;
    onChange(String(num).padStart(2, "0"));
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={value}
        maxLength={2}
        onChange={(e) => handleInputChange(e.target.value)}
        className="size-6 sm:size-8 text-center text-[10px] sm:text-sm font-bold border-none sm:border sm:border-border sm:rounded-lg text-slate-900 dark:text-white bg-transparent placeholder-slate-400 focus:outline-none transition-all"
        placeholder={placeholder}
      />
    </div>
  );
};

/* ---------------- AM / PM Toggle ---------------- */

interface AMPMToggleProps {
  value: AMPM;
  onChange: (value: AMPM) => void;
}

export const AMPMToggle: React.FC<AMPMToggleProps> = ({ value, onChange }) => {
  return (
    <div className="h-6 sm:h-8 flex gap-0.5 sm:gap-1 px-1 bg-muted rounded center border border-border">
      <button
        type="button"
        onClick={() => onChange("AM")}
        className={`h-4.5 w-5.5 sm:h-6 sm:w-7 center rounded-[2px] text-[8px] sm:text-xs font-bold transition-all cursor-pointer ${
          value === "AM"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        AM
      </button>
      <button
        type="button"
        onClick={() => onChange("PM")}
        className={`h-4.5 w-5.5 sm:h-6 sm:w-7 center rounded-[2px] text-[8px] sm:text-xs font-bold transition-all cursor-pointer ${
          value === "PM"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        PM
      </button>
    </div>
  );
};

/* ---------------- TimeRangePicker ---------------- */
interface TimeRangePickerProps {
  startHour: string;
  startMin: string;
  startPeriod: AMPM;
  endHour: string;
  endMin: string;
  endPeriod: AMPM;
  onChangeStartHour: (v: string) => void;
  onChangeStartMin: (v: string) => void;
  onChangeStartPeriod: (v: AMPM) => void;
  onChangeEndHour: (v: string) => void;
  onChangeEndMin: (v: string) => void;
  onChangeEndPeriod: (v: AMPM) => void;
  variant?: "professional" | "minimal";
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startHour,
  startMin,
  startPeriod,
  endHour,
  endMin,
  endPeriod,
  onChangeStartHour,
  onChangeStartMin,
  onChangeStartPeriod,
  onChangeEndHour,
  onChangeEndMin,
  onChangeEndPeriod,
  variant,
}) => {
  return (
    <div
      className={cn(
        "px-1 sm:px-4 py-1.5 sm:py-2 border-b border-border bg-muted/5 sm:bg-muted/10",
        variant === "minimal" && "space-y-4",
      )}
    >
      <div className="flex items-center justify-between gap-0.5 sm:gap-2">
        {/* Start */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground uppercase">
            From
          </span>
          <div className="flex gap-0.5 sm:gap-1 items-center bg-background rounded border border-border/80 p-0.5 shadow-sm">
            <NumberInput
              value={startHour}
              onChange={onChangeStartHour}
              min={1}
              max={12}
            />
            <span className="text-muted-foreground/60 font-bold text-[10px] sm:text-xs">
              :
            </span>
            <NumberInput
              value={startMin}
              onChange={onChangeStartMin}
              min={0}
              max={59}
            />
            <AMPMToggle value={startPeriod} onChange={onChangeStartPeriod} />
          </div>
        </div>

        <ArrowRightIcon className="text-muted-foreground/30 h-3 w-3 shrink-0" />

        {/* End */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground uppercase">
            To
          </span>
          <div className="flex gap-0.5 sm:gap-1 items-center bg-background rounded border border-border/80 p-0.5 shadow-sm">
            <NumberInput
              value={endHour}
              onChange={onChangeEndHour}
              min={1}
              max={12}
            />
            <span className="text-muted-foreground/60 font-bold text-[10px] sm:text-xs">
              :
            </span>
            <NumberInput
              value={endMin}
              onChange={onChangeEndMin}
              min={0}
              max={59}
            />
            <AMPMToggle value={endPeriod} onChange={onChangeEndPeriod} />
          </div>
        </div>
      </div>
    </div>
  );
};
