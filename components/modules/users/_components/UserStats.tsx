"use client";

import { Users, UserCheck, BadgeCheck, Store } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import type { UserStats as UserStatsData } from "../_types/users.types";

interface UserStatsProps {
  /** `GET /users/stats` — counts every user, not just the current page. */
  stats?: UserStatsData;
  loading?: boolean;
}

const EMPTY_STATS: UserStatsData = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  restrictedUsers: 0,
  newThisMonth: 0,
  verifiedUsers: 0,
  unverifiedUsers: 0,
  usersWithShop: 0,
  usersWithoutShop: 0,
};

export default function UserStats({ stats, loading }: UserStatsProps) {
  const {
    totalUsers,
    activeUsers,
    inactiveUsers,
    restrictedUsers,
    newThisMonth,
    verifiedUsers,
    unverifiedUsers,
    usersWithShop,
    usersWithoutShop,
  } = stats ?? EMPTY_STATS;

  const cards = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${newThisMonth} joined this month`,
    },
    {
      // The rest of the status enum, folded into the one number an admin acts
      // on: everybody who cannot currently get in.
      label: "Active",
      value: activeUsers,
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${inactiveUsers} inactive · ${restrictedUsers} blocked`,
    },
    {
      // Trust: an unverified account has claimed an address nobody confirmed.
      label: "Verified",
      value: verifiedUsers,
      icon: BadgeCheck,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${unverifiedUsers} unverified`,
    },
    {
      // The activation number: signing up is free, opening a shop is the point.
      // Everyone in the trend is a lead who arrived and then stopped.
      label: "Shop Owners",
      value: usersWithShop,
      icon: Store,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${usersWithoutShop} never opened one`,
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
