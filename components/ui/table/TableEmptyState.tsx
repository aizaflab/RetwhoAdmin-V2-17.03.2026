"use client";

import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

/** One button under the empty-state copy — a reload, a reset, a create. */
export interface TableEmptyAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "light";
  loading?: boolean;
}

export interface TableEmptyStateProps {
  /** Defaults to a neutral inbox so a table that passes nothing still reads well. */
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actions?: TableEmptyAction[];
  className?: string;
}

/**
 * The shared "nothing here" panel for every list table. Kept generic on
 * purpose: each table supplies its own icon, wording and buttons, so no
 * module has to rebuild this layout.
 */
const TableEmptyState = ({
  icon,
  title = "Nothing to show",
  description,
  actions = [],
  className,
}: TableEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
      className,
    )}
  >
    {/* Soft concentric rings keep the icon from floating in empty space. */}
    <div className="relative flex items-center justify-center">
      <span className="absolute size-24 rounded-full bg-primary/5" />
      <span className="absolute size-16 rounded-full bg-primary/10" />
      <span className="relative flex size-12 items-center justify-center rounded-full border border-primary/20 bg-card text-primary shadow-sm [&_svg]:size-6">
        {icon ?? <Inbox className="size-6" />}
      </span>
    </div>

    <div className="mt-2 space-y-1">
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground whitespace-normal">
          {description}
        </p>
      )}
    </div>

    {actions.length > 0 && (
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            size="sm"
            variant={action.variant ?? "outline"}
            startIcon={action.icon}
            loading={action.loading}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>
    )}
  </div>
);

export { TableEmptyState };
