"use client";

import { FileText, CheckCircle2, PenLine, Eye } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import type { BlogStats as BlogStatsData } from "../_types/blog.types";

interface BlogStatsProps {
  /** `GET /blogs/stats` — counts every post, not just the current page. */
  stats?: BlogStatsData;
  loading?: boolean;
}

const EMPTY_STATS: BlogStatsData = {
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  archivedPosts: 0,
  publishedThisMonth: 0,
  totalViews: 0,
  postsWithNoViews: 0,
};

/** 1,240 rather than 1240 — view counts get long. */
function compact(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
    value,
  );
}

export default function BlogStats({ stats, loading }: BlogStatsProps) {
  const {
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    publishedThisMonth,
    totalViews,
    postsWithNoViews,
  } = stats ?? EMPTY_STATS;

  // Average reads per published post — one post going viral is not the same
  // as the whole blog working, and this is the number that tells them apart.
  const avgViews =
    publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;

  const cards = [
    {
      label: "Total Posts",
      value: totalPosts,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${archivedPosts} archived`,
    },
    {
      label: "Published",
      value: publishedPosts,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${publishedThisMonth} this month`,
    },
    {
      // Work in progress: written but not reachable by anyone yet.
      label: "Drafts",
      value: draftPosts,
      icon: PenLine,
      color: draftPosts > 0 ? "text-warning" : "text-muted-foreground",
      bg: draftPosts > 0 ? "bg-warning/10" : "bg-muted",
      trend: `${draftPosts > 0 ? "waiting to be published" : "nothing pending"}`,
    },
    {
      // Reach. The trend calls out the posts that are live yet unread — the
      // ones worth promoting rather than writing more.
      label: "Total Views",
      value: compact(totalViews),
      icon: Eye,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${avgViews} avg · ${postsWithNoViews} unread`,
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
