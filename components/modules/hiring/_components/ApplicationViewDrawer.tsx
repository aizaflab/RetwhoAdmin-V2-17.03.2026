"use client";

import { useState } from "react";
import { UserCircle, FileText, ExternalLink } from "lucide-react";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";

import {
  APPLICATION_STATUS_OPTIONS,
  applicationStatusStyle,
} from "../_data/hiring-options";
import type { ApplicationStatus, JobApplication } from "../_types/hiring.types";

interface ApplicationViewDrawerProps {
  open: boolean;
  application?: JobApplication | null;
  onClose: () => void;
  onUpdateStatus?: (
    application: JobApplication,
    status: ApplicationStatus,
  ) => Promise<void> | void;
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

/** Read-only application detail, with the one action an admin has on it. */
export default function ApplicationViewDrawer({
  open,
  application,
  onClose,
  onUpdateStatus,
}: ApplicationViewDrawerProps) {
  // The caller clears its selection the moment the drawer closes. Hold on to
  // the last application so the panel still has content while it slides out.
  const [lastApplication, setLastApplication] = useState(application);
  if (application && application !== lastApplication) {
    setLastApplication(application);
  }

  const shown = application ?? lastApplication;
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
            <UserCircle className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {shown.fullName}
              </span>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${applicationStatusStyle(
                  shown.status,
                )}`}
              >
                {shown.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-normal text-muted-foreground">
              Application Details
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {/* A plain anchor rather than a Button: the file lives on S3 and
              should open in its own tab. */}
          {shown.resume?.url && (
            <a
              href={shown.resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FileText className="size-4" />
              Open Résumé
            </a>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Applied for */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Applied For
          </h3>
          <p className="text-sm font-medium text-foreground">
            {shown.hiring?.title || "—"}
          </p>
          {shown.hiring?.companyName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {shown.hiring.companyName}
            </p>
          )}
        </div>

        {/* Move along the pipeline without leaving the drawer. */}
        {onUpdateStatus && (
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Status
            </h3>
            <Select
              value={shown.status}
              onValueChange={(val) =>
                void onUpdateStatus(shown, val as ApplicationStatus)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Select status"
                  options={APPLICATION_STATUS_OPTIONS}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={APPLICATION_STATUS_OPTIONS} />
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Contact */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Email" value={shown.email} />
          <DetailRow label="Phone" value={shown.phone || "—"} />
          <DetailRow label="Applied On" value={formatDate(shown.createdAt)} />
          <DetailRow
            label="Reviewed"
            value={
              shown.reviewedAt ? (
                formatDate(shown.reviewedAt)
              ) : (
                <span className="text-muted-foreground">Not yet reviewed</span>
              )
            }
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow
            label="Résumé"
            value={
              shown.resume?.url ? (
                <a
                  href={shown.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <FileText className="size-3.5" />
                  {shown.resume.name || "Open file"}
                </a>
              ) : (
                <span className="text-muted-foreground">Not attached</span>
              )
            }
          />
          <DetailRow
            label="Portfolio"
            value={
              shown.portfolioUrl ? (
                <a
                  href={shown.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Visit
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )
            }
          />
        </div>

        {/* Cover letter */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Cover Letter
          </h3>
          {shown.coverLetter ? (
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
              {shown.coverLetter}
            </p>
          ) : (
            <p className="rounded-lg border border-dashed border-border py-3 text-center text-sm text-muted-foreground">
              No cover letter submitted
            </p>
          )}
        </div>

        {/* Internal notes left by whoever reviewed it. */}
        {shown.notes && (
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Internal Notes
            </h3>
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
              {shown.notes}
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
