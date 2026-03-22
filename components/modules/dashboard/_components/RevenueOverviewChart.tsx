/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useMemo, useState, useEffect } from "react";
import { ArrowUpOutlineIcon, CheckIcon } from "@/components/icons/Icons";

export default function RevenueOverviewChart() {
  const [selectedMetric, setSelectedMetric] = useState("Revenue");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const gridColor = isDark ? "#2a2a2a" : "#E5E7EB";
  const axisColor = isDark ? "#6B7280" : "#9CA3AF";

  const shipmentData = useMemo(
    () => [
      { month: "Jan", Paid: 800, Due: 1200, Revenue: 1000 },
      { month: "Feb", Paid: 1200, Due: 1800, Revenue: 1500 },
      { month: "Mar", Paid: 1600, Due: 2400, Revenue: 2000 },
      { month: "Apr", Paid: 1200, Due: 1800, Revenue: 1500 },
      { month: "May", Paid: 1700, Due: 2500, Revenue: 2100 },
      { month: "Jun", Paid: 2800, Due: 4200, Revenue: 3500 },
      { month: "Jul", Paid: 4000, Due: 6000, Revenue: 5000 },
      { month: "Aug", Paid: 6400, Due: 9600, Revenue: 8000 },
      { month: "Sep", Paid: 2800, Due: 4200, Revenue: 3500 },
      { month: "Oct", Paid: 2400, Due: 3600, Revenue: 3000 },
      { month: "Nov", Paid: 2200, Due: 3400, Revenue: 2800 },
      { month: "Dec", Paid: 1900, Due: 2900, Revenue: 2400 },
      { month: "Jan", Paid: 1800, Due: 2600, Revenue: 2200 },
      { month: "Feb", Paid: 1600, Due: 2400, Revenue: 2000 },
      { month: "Mar", Paid: 1400, Due: 2200, Revenue: 1800 },
      { month: "Apr", Paid: 2100, Due: 3100, Revenue: 2600 },
      { month: "May", Paid: 2600, Due: 3800, Revenue: 3200 },
    ],
    [],
  );

  return (
    <div className="lg:col-span-2">
      <div className="bg-white dark:bg-darkBg rounded-xl border border-border/70 dark:border-darkBorder/50 p-5">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Revenue Overview
          </h3>
          <div className="flex items-center gap-4">
            {[
              { name: "Paid", color: "#93C5FD" },
              { name: "Due", color: "#3B82F6" },
              { name: "Revenue", color: "#1E40AF" },
            ].map((metric) => (
              <button
                key={metric.name}
                onClick={() => setSelectedMetric(metric.name)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: metric.color }}
                >
                  {selectedMetric === metric.name && (
                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    selectedMetric === metric.name
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-text5"
                  }`}
                >
                  {metric.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-5 mb-5">
          {[
            { label: "Paid", value: "$45,231", change: "+12.5%", trend: "up" },
            { label: "Due", value: "$8,720", change: "-3.2%", trend: "down" },
            {
              label: "Revenue",
              value: "$53,951",
              change: "+8.1%",
              trend: "up",
            },
          ].map((stat, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span className="text-xs text-text5">{stat.label}:</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {stat.value}
              </span>
              <span
                className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                  stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                <ArrowUpOutlineIcon className="text-[10px]" />
                {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={shipmentData}
            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke={axisColor}
              style={{ fontSize: "12px", fontWeight: "500" }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke={axisColor}
              style={{ fontSize: "12px" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000) return `${value / 1000}k`;
                return value;
              }}
            />

            <Bar
              dataKey={selectedMetric}
              fill={
                selectedMetric === "Paid"
                  ? isDark
                    ? "#1E3A5F"
                    : "#DBEAFE"
                  : selectedMetric === "Due"
                    ? isDark
                      ? "#1E3A8A"
                      : "#BFDBFE"
                    : isDark
                      ? "#1E40AF"
                      : "#93C5FD"
              }
              radius={[50, 50, 50, 50]}
              maxBarSize={30}
              activeBar={(props: any) => {
                const { x, y, width, height, payload } = props;
                const deepFill =
                  selectedMetric === "Paid"
                    ? "#3B82F6"
                    : selectedMetric === "Due"
                      ? "#2563EB"
                      : "#1D4ED8";

                const value = payload[selectedMetric];
                const formattedValue =
                  value >= 1000
                    ? `${(value / 1000).toFixed(1)}k`
                    : value?.toLocaleString();

                return (
                  <g>
                    <line
                      x1={x + width / 2}
                      y1={y}
                      x2={1000}
                      y2={y}
                      stroke={axisColor}
                      strokeWidth="1"
                      strokeDasharray="5 5"
                    />
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={deepFill}
                      rx={15}
                      ry={15}
                    />
                    <foreignObject x={0} y={0} width="100%" height="100%">
                      <div
                        style={{
                          position: "absolute",
                          right: "0px",
                          top: `${y - 15}px`,
                          zIndex: 99999,
                          pointerEvents: "none",
                        }}
                      >
                        <div className="bg-gray-900 dark:bg-darkBorder text-white px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                          <p className="text-xs font-semibold">
                            Avg {formattedValue}
                          </p>
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
