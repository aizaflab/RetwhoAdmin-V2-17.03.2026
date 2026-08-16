"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { CaretDownOutlineIcon, CheckIcon } from "@/components/icons/Icons";

type Option = {
  value: string;
  label: string;
};

interface SimpleSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SimpleSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled = false,
}: SimpleSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);

  const selectId = useId();
  const listboxId = `${selectId}-listbox`;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative w-full">
      <button
        type="button"
        id={selectId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          // Layout
          "flex h-10 w-full cursor-pointer items-center justify-between px-3 text-sm",

          // Theme
          "bg-background text-foreground",

          // Border
          "ring-1 ring-border",

          // Focus
          "focus-visible:outline-none",
          "focus-visible:ring",
          "focus-visible:ring-ring",

          // Disabled
          "disabled:cursor-not-allowed",
          "disabled:opacity-60",

          // Animation
          "transition-all duration-200",

          className,
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            !selectedOption && "text-muted-foreground",
          )}
        >
          {selectedOption?.label || placeholder}
        </span>

        <CaretDownOutlineIcon
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        id={listboxId}
        role="listbox"
        aria-labelledby={selectId}
        className={cn(
          "absolute right-0 left-0 z-50 mt-2 overflow-hidden",

          // Theme
          "text-card-foreground",

          // Border
          "ring-1 ring-border",

          // Shadow
          "shadow-lg",

          // Animation
          "origin-top transition-all duration-200",

          isOpen
            ? "visible scale-100 opacity-100"
            : "pointer-events-none invisible scale-95 opacity-0",
        )}
      >
        <div className="max-h-52 overflow-y-auto">
          {options.length > 0 ? (
            options.map((option) => {
              const isSelected = value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",

                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className="truncate">{option.label}</span>

                  {isSelected && <CheckIcon className="size-4 shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleSelect;
