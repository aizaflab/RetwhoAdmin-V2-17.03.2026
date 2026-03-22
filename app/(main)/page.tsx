"use client";

import {
  DashboardStats,
  DashboardActivity,
  IncomeOverviewChart,
  RevenueOverviewChart,
} from "@/components/modules/dashboard";
import { useState } from "react";
import { HugeCalender } from "@/components/ui/calender/HugeCalender";

export default function DashboardPage() {
  // Date range state for HugeCalender
  const [inputRange, setInputRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: new Date(),
    end: new Date(),
  });

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg  border-text4/30 dark:border-darkBorder/50">
      <div className="mx-auto space-y-5">
        <div className=" flex items-center justify-between">
          <h1 className="text-2xl font-medium text-black">Dashboard</h1>
          <HugeCalender
            value={inputRange}
            onChange={setInputRange}
            variant="professional"
            dateDesignStyle="box"
            dateShape="rounded-md"
            inputClass="w-[230px]"
            placeholder="Select Date Range"
            align="right"
          />
        </div>
        {/* Dashboard Dashboard Modules */}
        <DashboardStats />
        {/* <DashboardCharts /> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <RevenueOverviewChart />
          <IncomeOverviewChart />
        </div>

        <DashboardActivity />
      </div>
    </div>
  );
}
