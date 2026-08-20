"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Briefcase,
  CalendarClock,
  Eye,
  GraduationCap,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { Dialog } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";

import {
  employmentTypeLabel,
  formatSalaryRange,
  hiringStatusStyle,
  hiringTypeLabel,
} from "../_data/hiring-options";
import type { HiringPost } from "../_types/hiring.types";

interface HiringViewDialogProps {
  open: boolean;
  onClose: () => void;
  post?: HiringPost | null;
  /** Omitted when the viewer cannot edit — the button is then not offered. */
  onEdit?: (post: HiringPost) => void;
  /** Jumps to this posting's applications; hidden when nobody has applied. */
  onViewApplications?: (post: HiringPost) => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

/** One labelled fact, with the icon carrying the category at a glance. */
function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-border bg-muted/30 p-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm wrap-break-word text-foreground">{value}</p>
      </div>
    </div>
  );
}

/** A list section — rendered only when the posting actually has entries. */
function BulletSection({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={`${title}-${i}`}
            className="flex gap-2 text-sm text-foreground"
          >
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
            <span className="wrap-break-word">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Read-only detail for one posting — everything the row cannot fit, without
 * leaving the list. The table's other action opens the *applications*; this one
 * answers "what does this posting actually say".
 */
export default function HiringViewDialog({
  open,
  onClose,
  post,
  onEdit,
  onViewApplications,
}: HiringViewDialogProps) {
  // The caller clears its selection the moment the dialog closes. Hold on to
  // the last posting so there is still content to show while it fades out —
  // otherwise this would unmount instantly and skip the exit animation.
  const [lastPost, setLastPost] = useState(post);
  if (post && post !== lastPost) setLastPost(post);

  const shown = post ?? lastPost;
  if (!shown) return null;

  const stats = shown.applicationStats;
  const applicationCount = stats?.total ?? 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xlarge"
      title="Hiring Details"
      description="A read-only view of this posting."
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {/* Only offered when there is something to look at. */}
          {onViewApplications && applicationCount > 0 && (
            <Button variant="outline" onClick={() => onViewApplications(shown)}>
              View {applicationCount} Application
              {applicationCount === 1 ? "" : "s"}
            </Button>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(shown)}>Edit Posting</Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Identity header — banner behind, logo and title over it. */}
        <div className="overflow-hidden rounded-xl border border-border">
          {shown.bannerImage?.url && (
            <div className="relative h-28 w-full bg-muted">
              <Image
                src={shown.bannerImage.url}
                alt={shown.bannerImage.alt || `${shown.title} banner`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="flex items-center gap-4 bg-linear-to-r from-primary/5 to-transparent p-4">
            {shown.companyLogo?.url ? (
              <Image
                src={shown.companyLogo.url}
                alt={shown.companyLogo.alt || shown.companyName}
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-lg object-cover ring-2 ring-primary/20"
                unoptimized
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-2 ring-primary/20">
                <Briefcase className="size-6 text-primary" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-foreground">
                {shown.title}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {shown.companyName}
                {shown.category?.title ? ` · ${shown.category.title}` : ""}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${hiringStatusStyle(
                shown.status,
              )}`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {shown.status}
            </span>
          </div>
        </div>

        {/* Application pipeline — the numbers the list row summarises. */}
        {stats && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(
              [
                ["Total", stats.total],
                ["Pending", stats.pending],
                ["Shortlisted", stats.shortlisted],
                ["Rejected", stats.rejected],
                ["Hired", stats.hired],
              ] as const
            ).map(([label, count]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center"
              >
                <p className="text-lg font-semibold text-foreground">{count}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Fact
            icon={<Briefcase className="size-4" />}
            label="Type"
            value={`${hiringTypeLabel(shown.hiringType)} · ${employmentTypeLabel(
              shown.employmentType,
            )}`}
          />
          <Fact
            icon={<Wallet className="size-4" />}
            label="Salary"
            value={formatSalaryRange(
              shown.salaryMin,
              shown.salaryMax,
              shown.salaryType,
              shown.currency,
            )}
          />
          <Fact
            icon={<MapPin className="size-4" />}
            label="Location"
            value={[shown.address, shown.city, shown.country]
              .filter(Boolean)
              .join(", ")}
          />
          <Fact
            icon={<Users className="size-4" />}
            label="Openings"
            value={shown.numberOfOpenings}
          />
          <Fact
            icon={<CalendarClock className="size-4" />}
            label="Deadline"
            value={formatDate(shown.applicationDeadline)}
          />
          <Fact
            icon={<GraduationCap className="size-4" />}
            label="Experience / Education"
            value={`${shown.experience || "—"} · ${shown.education || "—"}`}
          />
          <Fact
            icon={<Eye className="size-4" />}
            label="Views"
            value={shown.viewCount ?? 0}
          />
          <Fact
            icon={<CalendarClock className="size-4" />}
            label="Published"
            value={
              shown.publishedAt ? (
                formatDate(shown.publishedAt)
              ) : (
                <span className="text-muted-foreground">Not published yet</span>
              )
            }
          />
        </div>

        {shown.skills?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {shown.skills.map((skill, i) => (
                <span
                  key={`skill-${i}`}
                  className="rounded bg-muted px-2 py-0.5 text-xs text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <BulletSection title="Requirements" items={shown.requirements} />
        <BulletSection title="Benefits" items={shown.benefits} />

        {shown.description && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </p>
            {/* The editor stores HTML, which is why this is not rendered as
                plain text. It is authored by admins only — never by applicants
                — so there is no untrusted input in this string. */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground"
              dangerouslySetInnerHTML={{ __html: shown.description }}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
