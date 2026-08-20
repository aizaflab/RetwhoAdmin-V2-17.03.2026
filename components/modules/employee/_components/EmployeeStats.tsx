"use client";

import { Users, UserCheck, ShieldAlert, Clock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import type { EmployeeStats as EmployeeStatsData } from "../_types/employee.types";

interface EmployeeStatsProps {
  /** `GET /admin/employees/stats` — counts every employee, not just this page. */
  stats?: EmployeeStatsData;
  loading?: boolean;
}

const EMPTY_STATS: EmployeeStatsData = {
  totalEmployees: 0,
  activeEmployees: 0,
  inactiveEmployees: 0,
  newThisMonth: 0,
  fullAccessEmployees: 0,
  dormantEmployees: 0,
  neverLoggedIn: 0,
};

/** "1 employee" / "4 employees" — the trend lines read as sentences. */
function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export default function EmployeeStats({ stats, loading }: EmployeeStatsProps) {
  const {
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    newThisMonth,
    fullAccessEmployees,
    dormantEmployees,
    neverLoggedIn,
  } = stats ?? EMPTY_STATS;

  // Everyone who is not on a system role — plain subtraction, so it stays out
  // of the API.
  const limitedEmployees = totalEmployees - fullAccessEmployees;

  const cards = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: `${newThisMonth} added this month`,
    },
    {
      label: "Active",
      value: activeEmployees,
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
      trend: `${inactiveEmployees} inactive`,
    },
    {
      // The security number on this page: how many people can do anything at
      // all in the panel, because their role is a system role.
      label: "Full Access",
      value: fullAccessEmployees,
      icon: ShieldAlert,
      color: "text-warning",
      bg: "bg-warning/10",
      trend: `${limitedEmployees} on limited access`,
    },
    {
      // Accounts that can get in but don't — every one is standing risk for no
      // benefit. The trend calls out the sharper case: never used at all,
      // which usually means the invite email was missed.
      label: "Dormant",
      value: dormantEmployees,
      icon: Clock,
      color: dormantEmployees > 0 ? "text-warning" : "text-muted-foreground",
      bg: dormantEmployees > 0 ? "bg-warning/10" : "bg-muted",
      trend: `${plural(neverLoggedIn, "account")} never signed in`,
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
