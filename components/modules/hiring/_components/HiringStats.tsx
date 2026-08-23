"use client";

import { Briefcase, Radio, Inbox, UserCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import type { HiringOverview } from "../_types/hiring.types";

interface HiringStatsProps {
  /** `GET /hiring/overview` — tallies every posting and application. */
  overview?: HiringOverview;
  loading?: boolean;
}

const EMPTY_OVERVIEW: HiringOverview = {
  posts: { total: 0, draft: 0, published: 0, closed: 0, expired: 0 },
  applications: {
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  },
};

export default function HiringStats({ overview, loading }: HiringStatsProps) {
  const { posts, applications } = overview ?? EMPTY_OVERVIEW;

  const cards = [
    {
      label: "Total Postings",
      value: posts.total,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${posts.draft} draft · ${posts.closed} closed`,
    },
    {
      // `published` includes the expired ones — expiry is a slice of it, not a
      // separate status — so the trend names how many of them stopped working.
      label: "Live Postings",
      value: posts.published,
      icon: Radio,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${posts.expired} expired`,
    },
    {
      // The queue an admin actually works: applications nobody has looked at.
      label: "Applications",
      value: applications.total,
      icon: Inbox,
      color:
        applications.pending > 0 ? "text-warning" : "text-muted-foreground",
      bg: applications.pending > 0 ? "bg-warning/10" : "bg-muted",
      trend: `${applications.pending} awaiting review`,
    },
    {
      // The end of the pipeline — what all the postings were actually for.
      label: "Hired",
      value: applications.hired,
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${applications.shortlisted} shortlisted`,
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
