"use client";

import { Role } from "../_types/role.types";
import { Shield, Users, Key, TrendingUp } from "lucide-react";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";

interface RoleStatsProps {
  roles: Role[];
}

export default function RoleStats({ roles }: RoleStatsProps) {
  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.status === "active").length;
  const totalUsers = roles.reduce((acc, r) => acc + r.userCount, 0);
  const totalPerms = Object.values(PERMISSIONS).length;

  const stats = [
    {
      label: "Total Roles",
      value: totalRoles,
      icon: Shield,
      color: "text-primary dark:text-blue-400",
      bg: "bg-primary/10 dark:bg-primary/20",
      trend: `${activeRoles} active`,
      trendColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active Roles",
      value: activeRoles,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      trend: `${totalRoles - activeRoles} inactive/draft`,
      trendColor: "text-text5",
    },
    {
      label: "Total Users Assigned",
      value: totalUsers,
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      trend: "across all roles",
      trendColor: "text-text5",
    },
    {
      label: "Available Permissions",
      value: totalPerms,
      icon: Key,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      trend: "in the system",
      trendColor: "text-text5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative rounded-xl border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg p-4 sm:p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-text5 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-black dark:text-white mt-1.5 tabular-nums">
                {stat.value}
              </h3>
            </div>
            <div className={`p-2.5 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <p className={`text-xs mt-3 font-medium ${stat.trendColor}`}>
            {stat.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
