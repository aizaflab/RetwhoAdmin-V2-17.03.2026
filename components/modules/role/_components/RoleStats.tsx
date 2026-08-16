"use client";

import { Shield, ShieldCheck, ShieldOff, Key } from "lucide-react";

import { ROLE_PAGES, PERMISSION_ACTIONS } from "../_data/role-pages";
import { Role } from "../_types/role.types";

interface RoleStatsProps {
  roles: Role[];
}

export default function RoleStats({ roles }: RoleStatsProps) {
  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.status === "active").length;
  const inactiveRoles = totalRoles - activeRoles;
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const grantableActions = ROLE_PAGES.length * PERMISSION_ACTIONS.length;

  const stats = [
    {
      label: "Total Roles",
      value: totalRoles,
      icon: Shield,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${systemRoles} system`,
      trendColor: "text-muted-foreground",
    },
    {
      label: "Active Roles",
      value: activeRoles,
      icon: ShieldCheck,
      color: "text-success",
      bg: "bg-success/10",
      trend: "currently assignable",
      trendColor: "text-muted-foreground",
    },
    {
      label: "Inactive Roles",
      value: inactiveRoles,
      icon: ShieldOff,
      color: "text-warning",
      bg: "bg-warning/10",
      trend: "not assignable",
      trendColor: "text-muted-foreground",
    },
    {
      label: "Grantable Actions",
      value: grantableActions,
      icon: Key,
      color: "text-muted-foreground",
      bg: "bg-muted",
      trend: `${ROLE_PAGES.length} pages × 4`,
      trendColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative rounded-xl border border-border bg-card p-3 sm:p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <h3 className="poppins mt-1.5 text-2xl font-semibold tabular-nums text-foreground">
                {stat.value}
              </h3>
            </div>
            <div className={`rounded-lg p-2.5 ${stat.bg}`}>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
          </div>
          <p className={`mt-3 text-xs font-medium ${stat.trendColor}`}>
            {stat.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
