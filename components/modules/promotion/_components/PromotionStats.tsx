"use client";

import { Megaphone, Radio, CalendarClock, Archive } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import type { PromotionOverview } from "../_types/promotion.types";

interface PromotionStatsProps {
  /** `GET /promotions/overview` — tallies every campaign. */
  overview?: PromotionOverview;
  loading?: boolean;
}

const EMPTY_OVERVIEW: PromotionOverview = {
  total: 0,
  draft: 0,
  published: 0,
  archived: 0,
  live: 0,
  scheduled: 0,
  expired: 0,
};

export default function PromotionStats({
  overview,
  loading,
}: PromotionStatsProps) {
  const { total, draft, published, archived, live, scheduled, expired } =
    overview ?? EMPTY_OVERVIEW;

  const cards = [
    {
      label: "Total Campaigns",
      value: total,
      icon: Megaphone,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${draft} draft · ${archived} archived`,
    },
    {
      // The only number that says what a visitor sees right now: published
      // *and* inside its date window.
      label: "Live Now",
      value: live,
      icon: Radio,
      color: live > 0 ? "text-success" : "text-muted-foreground",
      bg: live > 0 ? "bg-success/10" : "bg-muted",
      trend: `of ${published} published`,
    },
    {
      // Approved and waiting for its start date — the pipeline ahead.
      label: "Scheduled",
      value: scheduled,
      icon: CalendarClock,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: "waiting to start",
    },
    {
      // Published, but the window closed and nobody archived them. Every one
      // is a campaign still marked live that no longer runs.
      label: "Expired",
      value: expired,
      icon: Archive,
      color: expired > 0 ? "text-destructive" : "text-muted-foreground",
      bg: expired > 0 ? "bg-destructive/10" : "bg-muted",
      trend: expired > 0 ? "still marked published" : "nothing overdue",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative rounded-xl border border-border bg-card p-3 sm:p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {card.label}
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-7 w-12" />
              ) : (
                <h3 className="poppins mt-1.5 text-2xl font-semibold tabular-nums text-foreground">
                  {card.value}
                </h3>
              )}
            </div>
            <div className={`rounded-lg p-2.5 ${card.bg}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            {card.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
