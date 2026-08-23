"use client";

import { useState } from "react";
import Image from "next/image";
import { Megaphone, ExternalLink, Eye } from "lucide-react";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Button } from "@/components/ui/button/Button";

import {
  PHASE_LABELS,
  PHASE_STYLES,
  audienceLabel,
  promotionPhase,
  promotionStatusStyle,
  promotionTypeLabel,
} from "../_data/promotion-options";
import type { Promotion } from "../_types/promotion.types";

interface PromotionViewDrawerProps {
  open: boolean;
  promotion?: Promotion | null;
  onClose: () => void;
  onEdit?: (promotion: Promotion) => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
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

/** Read-only campaign detail. */
export default function PromotionViewDrawer({
  open,
  promotion,
  onClose,
  onEdit,
}: PromotionViewDrawerProps) {
  // The caller clears its selection the moment the drawer closes. Hold on to
  // the last campaign so the panel still has content while it slides out.
  const [lastPromotion, setLastPromotion] = useState(promotion);
  if (promotion && promotion !== lastPromotion) setLastPromotion(promotion);

  const shown = promotion ?? lastPromotion;
  if (!shown) return null;

  const phase = promotionPhase(shown);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Megaphone className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {shown.title}
              </span>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${promotionStatusStyle(
                  shown.status,
                )}`}
              >
                {shown.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-normal text-muted-foreground">
              Campaign Details
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
            <Button onClick={() => onEdit(shown)}>Edit Campaign</Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner */}
        {shown.bannerImage?.url && (
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border">
            <Image
              src={shown.bannerImage.url}
              alt={shown.bannerImage.alt || shown.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-foreground">
            {shown.description || "No description provided."}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Eye className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Views
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {(shown.viewCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Megaphone className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Priority
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {shown.priority ?? 0}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow
            label="Type"
            value={promotionTypeLabel(shown.promotionType)}
          />
          <DetailRow
            label="Lifecycle"
            value={
              // Derived from the dates, not stored — the status alone only
              // says whether it was approved.
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${PHASE_STYLES[phase]}`}
              >
                {PHASE_LABELS[phase]}
              </span>
            }
          />
          <DetailRow label="Starts" value={formatDate(shown.startDate)} />
          <DetailRow label="Ends" value={formatDate(shown.endDate)} />
          <DetailRow
            label="Sponsor"
            value={shown.wholesaler?.companyName || "Platform-wide"}
          />
          <DetailRow
            label="Video URL"
            value={
              shown.videoUrl ? (
                <a
                  href={shown.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Open
                </a>
              ) : (
                "—"
              )
            }
          />
        </div>

        {/* Audience */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Target Audience
          </h3>
          <div className="flex flex-wrap gap-2">
            {(shown.targetAudience ?? []).length > 0 ? (
              shown.targetAudience.map((audience) => (
                <span
                  key={audience}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {audienceLabel(audience)}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No audience selected
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {(shown.tags ?? []).length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {shown.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
