"use client";

import type React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        "text-gray-700 dark:text-gray-200",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "group-data-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
