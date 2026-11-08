"use client";

import { BadgePercent, Store, Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import { ruleText } from "../_data/wholesaler-commission-options";
import type { WholesalerCommissionStatsData as Stats } from "../_types/wholesaler-commission.types";

interface WholesalerCommissionStatsProps {
  /** `GET /admin/wholesaler-commissions/stats` — every wholesaler, not this page. */
  stats?: Stats;
  loading?: boolean;
}

export default function WholesalerCommissionStats({
  stats,
  loading,
}: WholesalerCommissionStatsProps) {
  const cards = [
    {
      label: "Wholesaler Shops",
      value: String(stats?.totalWholesalers ?? 0),
      icon: Store,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: "Every wholesaler shop on Retwho",
    },
    {
      label: "On Their Own Rate",
      value: String(stats?.customRates ?? 0),
      icon: BadgePercent,
      color: "text-warning",
      bg: "bg-warning/10",
      trend: "Charged the rate set for them",
    },
    {
      label: "On The Global Rate",
      value: String(stats?.globalRates ?? 0),
      icon: Users,
      color: "text-success",
      bg: "bg-success/10",
      trend: `Global: ${ruleText(stats?.globalCommission)}`,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
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
