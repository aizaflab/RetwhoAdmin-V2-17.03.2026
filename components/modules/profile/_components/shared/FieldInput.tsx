import React from "react";
import { cn } from "@/lib/utils";

export function FieldInput({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
  icon: Icon,
  readonly,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  icon?: React.ElementType;
  readonly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text5 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text5 pointer-events-none" />
        )}
        <input
          type={type}
          value={value}
          readOnly={readonly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full text-sm px-3 py-2.5 rounded-xl border transition-all",
            Icon && "pl-9",
            readonly
              ? "bg-gray-light dark:bg-darkPrimary/50 text-text5 cursor-not-allowed border-border/40 dark:border-darkBorder/40"
              : "bg-white dark:bg-darkBg border-border dark:border-darkBorder text-text6 dark:text-text4 focus:outline-none focus:border-primary dark:focus:border-darkLight/50 hover:border-border/70 dark:hover:border-darkBorder/70",
          )}
        />
      </div>
    </div>
  );
}
