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
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
              ? "bg-gray-light text-muted-foreground cursor-not-allowed border-border/40"
              : "bg-card border-border text-foreground focus:outline-none focus:border-primary hover:border-border/70",
          )}
        />
      </div>
    </div>
  );
}
