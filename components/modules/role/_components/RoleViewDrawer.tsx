"use client";

import { useState } from "react";
import { Shield, Key, Users } from "lucide-react";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Button } from "@/components/ui/button/Button";

import PermissionMatrix from "./PermissionMatrix";
import { countGrants } from "../_data/role-pages";
import type { Role } from "../_types/role.types";

interface RoleViewDrawerProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
  onEdit?: (role: Role) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

/** Slide-in panel showing a role's details and its permission matrix. */
export default function RoleViewDrawer({
  open,
  onClose,
  role,
  onEdit,
}: RoleViewDrawerProps) {
  // The caller clears its selection the moment the drawer closes. Hold on to
  // the last role so the panel still has content to show while it slides out —
  // otherwise this would unmount instantly and skip the exit animation.
  const [lastRole, setLastRole] = useState(role);
  if (role && role !== lastRole) setLastRole(role);

  const shownRole = role ?? lastRole;
  if (!shownRole) return null;

  const grants = countGrants(shownRole.permissions);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {shownRole.name}
              </span>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                  STATUS_STYLES[shownRole.status] ?? STATUS_STYLES.inactive
                }`}
              >
                {shownRole.status}
              </span>
              {shownRole.isSystem && (
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  System
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-normal text-muted-foreground">
              Role Details
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && !shownRole.isSystem && (
            <Button onClick={() => onEdit(shownRole)}>Edit Role</Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-foreground">
            {shownRole.description || "No description provided."}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Key className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Permissions
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {grants}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Employees
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {shownRole.employeeCount ?? 0}
            </p>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Permissions
          </h3>
          {grants === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-3 text-center text-sm text-muted-foreground">
              No permissions assigned
            </p>
          ) : (
            <PermissionMatrix value={shownRole.permissions} readOnly compact />
          )}
        </div>
      </div>
    </Drawer>
  );
}
