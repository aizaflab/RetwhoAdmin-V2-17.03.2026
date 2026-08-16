"use client";

import { useState } from "react";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { Dialog } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";

import { getRoleName } from "../_data/employee-options";
import type { Employee } from "../_types/employee.types";

interface EmployeeViewDialogProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onEdit?: (employee: Employee) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm wrap-break-word text-foreground">{value}</span>
    </div>
  );
}

/** Read-only employee profile. */
export default function EmployeeViewDialog({
  open,
  onClose,
  employee,
  onEdit,
}: EmployeeViewDialogProps) {
  // The caller clears its selection the moment the dialog closes. Hold on to
  // the last employee so there is still content to show while it fades out —
  // otherwise this would unmount instantly and skip the exit animation.
  const [lastEmployee, setLastEmployee] = useState(employee);
  if (employee && employee !== lastEmployee) setLastEmployee(employee);

  const shown = employee ?? lastEmployee;
  if (!shown) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xlarge"
      title="Employee Details"
      description="A read-only view of this employee's record."
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(shown)}>Edit Employee</Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Identity header — status sits opposite the name so the row reads
            left-to-right: who they are, then their state. */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-linear-to-r from-primary/5 to-transparent p-4">
          {shown.profileImage?.url ? (
            <Image
              src={shown.profileImage.url}
              alt={shown.name}
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
              unoptimized
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
              <UserCircle className="h-7 w-7 text-primary" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {shown.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {shown.email}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
              STATUS_STYLES[shown.status] ?? STATUS_STYLES.inactive
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {shown.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Phone" value={shown.phone || "—"} />
          <DetailRow label="Role" value={getRoleName(shown.roleId)} />
          <DetailRow label="Created At" value={formatDate(shown.createdAt)} />
          <DetailRow label="Last Updated" value={formatDate(shown.updatedAt)} />
        </div>
      </div>
    </Dialog>
  );
}
