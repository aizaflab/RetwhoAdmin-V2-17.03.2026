"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Button } from "@/components/ui/button/Button";
import { useGetSupportResourceQuery } from "@/featured/support/supportApiSlice";

import { supportStatusStyle } from "../../_data/support-options";
import type { SupportResourceItem } from "../../_types/support.types";

interface ResourceViewDrawerProps {
  open: boolean;
  resource?: SupportResourceItem | null;
  onClose: () => void;
  onEdit?: (resource: SupportResourceItem) => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

/** Read-only resource detail, refreshed from `GET /support/resources/:id`. */
export default function ResourceViewDrawer({
  open,
  resource,
  onClose,
  onEdit,
}: ResourceViewDrawerProps) {
  // The caller clears its selection the moment the drawer closes. Hold on to
  // the last resource so the panel still has content while it slides out.
  const [lastResource, setLastResource] = useState(resource);
  if (resource && resource !== lastResource) setLastResource(resource);

  const row = resource ?? lastResource;

  // The list row renders straight away; the single fetch swaps in the latest
  // copy in case it changed since the list loaded.
  const { data: fresh } = useGetSupportResourceQuery(row?._id ?? "", {
    skip: !open || !row?._id,
  });

  const shown = fresh && fresh._id === row?._id ? fresh : row;
  if (!shown) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {shown.title}
              </span>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${supportStatusStyle(
                  shown.status,
                )}`}
              >
                {shown.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-normal text-muted-foreground">
              /{shown.slug}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(shown)}>Edit Resource</Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Description
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
            {shown.description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Created" value={formatDate(shown.createdAt)} />
          <DetailRow label="Last Updated" value={formatDate(shown.updatedAt)} />
          <DetailRow
            label="Published"
            value={
              shown.publishedAt
                ? formatDate(shown.publishedAt)
                : "Not published yet"
            }
          />
          <DetailRow label="Created By" value={shown.createdBy?.name || "—"} />
        </div>
      </div>
    </Drawer>
  );
}
