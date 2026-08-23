"use client";

import { Shield, ShieldCheck, UserCheck, UserX } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import type { RoleStats as RoleStatsData } from "../_types/role.types";

interface RoleStatsProps {
  /** `GET /admin/roles/stats` — counts every role, not just the current page. */
  stats?: RoleStatsData;
  loading?: boolean;
}

const EMPTY_STATS: RoleStatsData = {
  totalRoles: 0,
  activeRoles: 0,
  inactiveRoles: 0,
  systemRoles: 0,
  activeRolesInUse: 0,
  activeRolesUnused: 0,
  unusedRoles: 0,
  assignedEmployees: 0,
};

/** "1 employee" / "4 employees" — the trend lines read as sentences. */
function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export default function RoleStats({ stats, loading }: RoleStatsProps) {
  const {
    totalRoles,
    activeRoles,
    inactiveRoles,
    systemRoles,
    activeRolesInUse,
    activeRolesUnused,
    unusedRoles,
    assignedEmployees,
  } = stats ?? EMPTY_STATS;

  // The roles this admin actually owns — the ones that can be edited or
  // deleted at all. Plain subtraction, so it stays out of the API.
  const customRoles = totalRoles - systemRoles;

  const cards = [
    {
      label: "Total Roles",
      value: totalRoles,
      icon: Shield,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${systemRoles} system · ${customRoles} custom`,
    },
    {
      label: "Active Roles",
      value: activeRoles,
      icon: ShieldCheck,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${inactiveRoles} inactive`,
    },
    {
      label: "Roles In Use",
      value: activeRolesInUse,
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${plural(assignedEmployees, "employee")} assigned`,
    },
    {
      // Any status, because an inactive role nobody holds is just as deletable
      // as an active one — this headline is "roles you could remove today".
      label: "Unused Roles",
      value: unusedRoles,
      icon: UserX,
      color: "text-warning",
      bg: "bg-warning/10",
      // The worrying subset: still assignable, yet nobody was ever given it.
      trend: `${activeRolesUnused} active with no employee`,
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
