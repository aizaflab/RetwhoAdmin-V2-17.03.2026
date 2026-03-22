"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

const COLORS = ["#EBF4DD", "#90AB8B", "#5A7863", "#778873"];

const data = [
  { name: "Category A", value: 275 },
  { name: "Category B", value: 90 },
  { name: "Category C", value: 173 },
  { name: "Category D", value: 187 },
];

export default function IncomeOverviewChart() {
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

  return (
    <div className="bg-white dark:bg-darkBg rounded-xl border border-border/70 dark:border-darkBorder/50 p-5">
      <div className="mb-2">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Income Overview
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={255}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={{
              position: "outside",
              fill: isDark ? "#9CA3AF" : "#1F2937",
              fontSize: 13,
              fontWeight: "600",
            }}
            labelLine={{
              stroke: isDark ? "#4B5563" : "#9CA3AF",
              strokeWidth: 1,
            }}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1a1d29" : "#fff",
              border: `1px solid ${isDark ? "#2a2a2a" : "#E5E7EB"}`,
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
              color: isDark ? "#F9FAFB" : "#1F2937",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2.5 grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS[index] }}
            />
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-text5">{item.name} :</span>
              <p className="text-sm font-semibold text-black dark:text-white">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
