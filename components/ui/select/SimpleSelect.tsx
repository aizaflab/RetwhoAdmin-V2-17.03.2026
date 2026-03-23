"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { CaretDownOutlineIcon, CheckIcon } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";

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
  arrowClass?: string;
}

const SimpleSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  arrowClass,
}: SimpleSelectProps) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  // Generate a unique ID for this instance
  const selectId = useId();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Toggle the dropdown open/close
  const toggleDropdown = () => {
    if (!disabled) {
      setIsSelectOpen((prev) => !prev);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: Option) => {
    onChange(option.value);
    setIsSelectOpen(false); // Close dropdown after selection
  };

  return (
    <div ref={selectRef} className="relative ">
      <button
        id={selectId}
        className={cn(
          "flex justify-between items-center w-full h-8 px-3 pr-1 border border-border dark:border-[#3d3d3d] text-sm capitalize cursor-pointer bg-transparent transition-colors  focus:outline-none",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isSelectOpen}
        aria-controls={`${selectId}-listbox`}
        disabled={disabled}
      >
        <span>
          {options.find((opt) => opt.value === value)?.label ||
            value ||
            placeholder}
        </span>
        <CaretDownOutlineIcon
          className={` size-5 transition-transform duration-300 ${isSelectOpen ? "rotate-180" : "rotate-0"} ${arrowClass}`}
        />
      </button>

      <div
        id={`${selectId}-listbox`}
        role="listbox"
        className={cn(
          "absolute left-0 right-0 mt-1 dark:bg-[#3D3D3D] bg-white text-text6 border border-border shadow-md transition-all duration-300 z-50 rounded-sm",
          isSelectOpen
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 translate-y-2",
        )}
      >
        <div className="max-h-52 overflow-auto sideBar2">
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={value === option.value ? "true" : "false"}
              className={cn(
                "pl-3 pr-2 py-2 cursor-pointer transition-colors capitalize text-sm flex items-center justify-between",
                value === option.value
                  ? "dark:bg-[#4f4f4f] bg-text5 text-white"
                  : "hover:bg-muted/50",
              )}
              onClick={() => handleOptionSelect(option)}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && <CheckIcon className="size-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleSelect;
