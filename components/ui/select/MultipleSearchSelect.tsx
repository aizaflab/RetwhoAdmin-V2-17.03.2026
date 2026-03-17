"use client";

import { cn } from "@/lib/utils";
import {
  CheckIcon,
  PlusIcon,
  XIcon,
  ChevronUpIcon,
  SearchIcon,
} from "@/components/icons/Icons";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
  JSX,
} from "react";

// --- Type Definitions ---

interface Option {
  value: string | number;
  label: string;
  description?: string;
}

interface MultipleSearchSelectProps {
  className?: string;
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  value?: (string | number)[];
  onValueChange?: (value: (string | number)[]) => void;
  onChange?: (event: { target: { value: (string | number)[] } }) => void;
  defaultValue?: (string | number)[];
  optionRenderer?: (
    option: Option,
    isSelected: boolean,
    isHighlighted: boolean,
  ) => JSX.Element;
  maxItems?: number;
  requiredSign?: boolean;
}

// --- Component ---

const MultipleSearchSelect = forwardRef<
  HTMLDivElement,
  MultipleSearchSelectProps
>(
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
      placeholder = "Select options",
      searchPlaceholder = "Search...",
      onValueChange,
      onChange,
      value, // Controlled value
      defaultValue = [], // Uncontrolled value
      optionRenderer,
      maxItems = Number.POSITIVE_INFINITY,
      requiredSign = false,
      ...props
    },
    ref,
  ) => {
    // 1. Initialize State with Controlled/Uncontrolled Logic
    const initialValue =
      value !== undefined
        ? (value as (string | number)[])
        : Array.isArray(defaultValue)
          ? defaultValue
          : [];

    const [selectedValues, setSelectedValues] =
      useState<(string | number)[]>(initialValue);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // 2. Refs (Typed)
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const optionsRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    // 3. Derived/Computed Values
    const selectedOptions: Option[] = options.filter((option) =>
      selectedValues.includes(option.value),
    );

    const filteredOptions: Option[] = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedValues.length < maxItems ||
          selectedValues.includes(option.value)),
    );

    // 4. Effects
    // Synchronize controlled 'value' prop with internal state (The only use case where setState in useEffect is typically acceptable for controlled components)
    useEffect(() => {
      if (
        value !== undefined &&
        JSON.stringify(value) !== JSON.stringify(selectedValues)
      ) {
        setSelectedValues(Array.isArray(value) ? value : []);
      }
    }, [value, selectedValues]); // Added selectedValues to dependency array for comparison

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (dropdownRef.current && !dropdownRef.current.contains(target)) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 10);
      }
    }, [isOpen]);

    // 5. Handlers
    const updateSelectedValues = (newSelectedValues: (string | number)[]) => {
      // Update local state if the component is uncontrolled (value === undefined)
      if (value === undefined) {
        setSelectedValues(newSelectedValues);
      }

      // Call external handlers
      if (onChange) {
        const syntheticEvent = { target: { value: newSelectedValues } };
        onChange(syntheticEvent);
      }

      if (onValueChange) {
        onValueChange(newSelectedValues);
      }

      // console.log("Selected values after update:", newSelectedValues); // Removed console.log for clean TS output
    };

    const handleOptionToggle = (optionValue: string | number) => {
      let newSelectedValues: (string | number)[];
      const currentValues = value !== undefined ? value : selectedValues;

      if (currentValues.includes(optionValue)) {
        newSelectedValues = currentValues.filter((v) => v !== optionValue);
      } else if (currentValues.length < maxItems) {
        newSelectedValues = [...currentValues, optionValue];
      } else {
        return; // Max items reached
      }

      updateSelectedValues(newSelectedValues);
    };

    const handleRemoveValue = (
      optionValue: string | number,
      e: ReactMouseEvent<HTMLButtonElement>,
    ) => {
      e.stopPropagation();

      const currentValues = value !== undefined ? value : selectedValues;
      const newSelectedValues = currentValues.filter((v) => v !== optionValue);

      updateSelectedValues(newSelectedValues);
    };

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      // Prevent handling navigation keys if search input is active and not escape/enter
      if (
        document.activeElement === searchInputRef.current &&
        e.key !== "Escape" &&
        e.key !== "Enter"
      ) {
        return;
      }

      if (
        !isOpen &&
        (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
      ) {
        setIsOpen(true);
        e.preventDefault();
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setSearchQuery("");
          // Refocus the trigger button after closing
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex =
              prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : 0;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex =
              prevIndex > 0 ? prevIndex - 1 : filteredOptions.length - 1;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionToggle(filteredOptions[highlightedIndex].value);
          }
          break;
        default:
          break;
      }
    };

    const scrollOptionIntoView = (index: number) => {
      const optionsContainer = optionsRef.current;
      // Index + 1 because the search bar is the first element
      const optionElement = optionsContainer?.children[index + 1] as
        | HTMLDivElement
        | undefined;

      if (optionsContainer && optionElement) {
        optionElement.scrollIntoView({
          block: "nearest",
          inline: "start",
        });
      }
    };

    // Default option renderer if none provided
    const defaultOptionRenderer = (
      option: Option,
      isSelected: boolean,
      isHighlighted: boolean,
    ): JSX.Element => (
      <div
        className={cn(
          "flex items-center text-sm px-3 py-2 cursor-pointer rounded transition-colors",
          isSelected
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50 text-foreground",
          isHighlighted && !isSelected && "bg-accent/30",
        )}
      >
        <div className="flex-1">{option.label}</div>
        {isSelected ? (
          <CheckIcon className="h-4 w-4 text-current" />
        ) : selectedValues.length < maxItems ? (
          <PlusIcon className="h-4 w-4 text-muted-foreground" />
        ) : null}
        {option.description && (
          <span className="ml-2 text-xs text-muted-foreground">
            {option.description}
          </span>
        )}
      </div>
    );

    // Use custom renderer or default
    const renderOption = optionRenderer || defaultOptionRenderer;

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setHighlightedIndex(-1);
    };

    const clearSearch = () => {
      setSearchQuery("");
      searchInputRef.current?.focus();
    };

    const clearAll = (e: ReactMouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      updateSelectedValues([]);
    };

    // Determine which set of values to use for display/logic (Controlled vs. Uncontrolled)
    const currentSelectedValues = value !== undefined ? value : selectedValues;
    const isMaxItemsSelected = currentSelectedValues.length >= maxItems;

    return (
      <div
        className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}
        ref={ref}
      >
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {requiredSign && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className={cn(
              "flex min-h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all",
              startIcon && "pl-10",
              error && "border-destructive",
              className,
            )}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            ref={triggerRef}
            {...props}
          >
            <div className="flex flex-wrap items-center gap-1 pr-2">
              {startIcon && (
                <span className="absolute left-3 flex items-center pointer-events-none text-muted-foreground ">
                  {startIcon}
                </span>
              )}

              {currentSelectedValues.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <div className="flex flex-wrap gap-1 max-w-full">
                  {selectedOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs"
                    >
                      <span className="truncate max-w-[150px]">
                        {option.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveValue(option.value, e)}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {currentSelectedValues.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  aria-label="Clear all selections"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
              {endIcon ? (
                <span className="flex items-center text-gray-500 dark:text-gray-200">
                  {endIcon}
                </span>
              ) : (
                <span className="flex items-center text-gray-500 dark:text-gray-200">
                  <ChevronUpIcon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isOpen ? "rotate-0" : "rotate-180",
                    )}
                  />
                </span>
              )}
            </div>
          </button>

          <div
            className={cn(
              "absolute z-10 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md transition-all duration-300",
              isOpen
                ? " visible opacity-100 top-full"
                : "top-[calc(100%+10px)] invisible opacity-0",
            )}
            // eslint-disable-next-line react-hooks/refs
            style={{ minWidth: triggerRef.current?.offsetWidth }}
            role="listbox"
            aria-multiselectable="true"
          >
            <div
              className="max-h-60 overflow-auto sideBar bg-popover rounded-md p-1.5 pt-0 space-y-1"
              ref={optionsRef}
            >
              {/* Search input */}
              <div className="sticky top-0 bg-popover p-1 mb-1 border-b border-border">
                <div className="relative mt-1.5">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    ref={searchInputRef}
                    className="w-full h-9 pl-8 pr-8 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:border-muted-foreground/50 transition-all"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Search options"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Clear search"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {currentSelectedValues.length > 0 && (
                  <div className="flex justify-between items-center mt-2 px-1 text-xs text-gray-500 dark:text-gray-300">
                    <span>{currentSelectedValues.length} selected</span>
                    {maxItems < Number.POSITIVE_INFINITY && (
                      <span
                        className={cn(
                          isMaxItemsSelected
                            ? "text-amber-500"
                            : "text-muted-foreground",
                        )}
                      >
                        {isMaxItemsSelected
                          ? "Maximum items selected"
                          : `${maxItems - currentSelectedValues.length} more available`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={currentSelectedValues.includes(option.value)}
                    tabIndex={-1}
                    onClick={() => handleOptionToggle(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                  >
                    {renderOption(
                      option,
                      currentSelectedValues.includes(option.value),
                      highlightedIndex === index,
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}

        {error && (
          <p className="text-xs text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  },
);

MultipleSearchSelect.displayName = "MultipleSearchSelect";

export { MultipleSearchSelect };
