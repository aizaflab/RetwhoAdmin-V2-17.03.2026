"use client";

import { Checkbox } from "@/components/ui/checkbox/Checkbox";

import {
  PERMISSION_ACTIONS,
  countGrants,
  getPageLabel,
  normalizePermissions,
  type PermissionAction,
} from "../_data/role-pages";
import type { RolePermission } from "../_types/role.types";

interface PermissionMatrixProps {
  /** The role's `permissions` array — partial lists are filled in for display. */
  value: RolePermission[];
  onChange?: (next: RolePermission[]) => void;
  readOnly?: boolean;
  /** Tighter columns for narrow containers (drawers, dialogs). */
  compact?: boolean;
}

const ACTION_LABELS: Record<PermissionAction, string> = {
  add: "Add",
  edit: "Edit",
  view: "View",
  delete: "Delete",
};

/**
 * One row per page, one checkbox per action — the exact shape the API stores
 * in `permissions[]`.
 */
export default function PermissionMatrix({
  value,
  onChange,
  readOnly = false,
  compact = false,
}: PermissionMatrixProps) {
  const rows = normalizePermissions(value);

  const totalGrants = countGrants(rows);
  const maxGrants = rows.length * PERMISSION_ACTIONS.length;
  const allSelected = totalGrants === maxGrants;

  const gridCols = compact
    ? "grid-cols-[1fr_60px_60px_60px_60px]"
    : "grid-cols-[1fr_80px_80px_80px_80px] md:grid-cols-[1fr_100px_100px_100px_100px]";

  const toggleAll = () => {
    if (readOnly || !onChange) return;
    const next = !allSelected;
    onChange(
      rows.map((row) => ({
        page: row.page,
        add: next,
        edit: next,
        view: next,
        delete: next,
      })),
    );
  };

  const toggleRow = (page: string) => {
    if (readOnly || !onChange) return;
    onChange(
      rows.map((row) => {
        if (row.page !== page) return row;
        const next = !PERMISSION_ACTIONS.every((action) => row[action]);
        return {
          page: row.page,
          add: next,
          edit: next,
          view: next,
          delete: next,
        };
      }),
    );
  };

  const toggleAction = (page: string, action: PermissionAction) => {
    if (readOnly || !onChange) return;
    onChange(
      rows.map((row) =>
        row.page === page ? { ...row, [action]: !row[action] } : row,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            All Permissions
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalGrants} of {maxGrants} granted
          </p>
        </div>
        {!readOnly && (
          <label className="relative inline-flex cursor-pointer items-center select-none">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={allSelected}
              onChange={toggleAll}
            />
            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-card after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
          </label>
        )}
      </div>

      <div className="rounded-lg border border-border/50 bg-card">
        <div className={compact ? "overflow-x-auto" : ""}>
          <div className={compact ? "min-w-105" : "min-w-130"}>
            {/* Header */}
            <div
              className={`grid items-center rounded-t-lg border-b border-border/50 bg-muted/50 px-4 py-3 ${gridCols}`}
            >
              <div className="text-sm font-semibold text-foreground">Pages</div>
              {PERMISSION_ACTIONS.map((action) => (
                <div
                  key={action}
                  className="text-center text-sm font-semibold text-foreground"
                >
                  {ACTION_LABELS[action]}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/40">
              {rows.map((row) => {
                const rowAll = PERMISSION_ACTIONS.every(
                  (action) => row[action],
                );
                return (
                  <div
                    key={row.page}
                    className={`grid items-center px-4 py-3 transition-colors hover:bg-muted/40 ${gridCols}`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.page)}
                        disabled={readOnly}
                        className="text-left text-sm font-medium text-foreground disabled:cursor-default enabled:cursor-pointer enabled:hover:text-primary"
                      >
                        {getPageLabel(row.page)}
                      </button>
                      {rowAll && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          full
                        </span>
                      )}
                    </div>

                    {PERMISSION_ACTIONS.map((action) => (
                      <div key={action} className="flex justify-center">
                        <Checkbox
                          checked={row[action]}
                          onCheckedChange={() => toggleAction(row.page, action)}
                          disabled={readOnly}
                          size="md"
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
