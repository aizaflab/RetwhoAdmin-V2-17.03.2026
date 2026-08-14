"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#EBF4DD", "#90AB8B", "#5A7863", "#778873"];

const data = [
  { name: "Category A", value: 275 },
  { name: "Category B", value: 90 },
  { name: "Category C", value: 173 },
  { name: "Category D", value: 187 },
];

export default function IncomeOverviewChart() {
  // Recharts writes these straight into SVG/inline styles, so CSS variables
  // resolve per theme without a class observer.
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-2">
        <h3 className="text-xl font-semibold text-foreground">
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
              fill: "var(--foreground)",
              fontSize: 13,
              fontWeight: "600",
            }}
            labelLine={{
              stroke: "var(--muted-foreground)",
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
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
              color: "var(--popover-foreground)",
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
              <span className="text-xs text-muted-foreground">
                {item.name} :
              </span>
              <p className="text-sm font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
