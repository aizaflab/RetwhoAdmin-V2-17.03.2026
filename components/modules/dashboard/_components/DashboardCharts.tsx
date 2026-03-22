import { ArrowUpIcon } from "lucide-react";

export default function DashboardCharts() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const revenueData = [35000, 42000, 38000, 50000, 48000, 58000, 64000];
  const salesData = [120, 150, 180, 220, 200, 250, 280];

  const maxRevenue = Math.max(...revenueData);
  const maxSales = Math.max(...salesData);

  // Calculate SVG Path for Area Chart
  const createAreaPath = (data: number[]) => {
    const width = 1000;
    const height = 150;
    const padding = 10;
    const stepX = (width - padding * 2) / (data.length - 1);
    const scaleY = (height - padding * 2) / maxRevenue;

    let d = `M ${padding} ${height - padding - data[0] * scaleY}`;
    for (let i = 1; i < data.length; i++) {
      const x = padding + i * stepX;
      const y = height - padding - data[i] * scaleY;
      d += ` L ${x} ${y}`;
    }
    return d;
  };

  const createFillPath = (data: number[]) => {
    const width = 1000;
    const height = 150;
    const padding = 10;
    const d = createAreaPath(data);
    const stepX = (width - padding * 2) / (data.length - 1);

    // Add points to close the area
    return `${d} L ${padding + (data.length - 1) * stepX} ${height} L ${padding} ${height} Z`;
  };

  const areaPath = createAreaPath(revenueData);
  const fillPath = createFillPath(revenueData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Revenue Analytics (Area Chart) */}
      <div className="lg:col-span-2 rounded-xl border border-text4/30 dark:border-darkBorder/50 bg-white dark:bg-darkBg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-base font-semibold text-black dark:text-white">
              Revenue Analytics
            </h4>
            <p className="text-xs text-text5">Monthly revenue trend</p>
          </div>
          <div className="flex items-center text-emerald-500 text-sm font-medium">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            +14% from last period
          </div>
        </div>

        <div className="relative h-40 w-full mt-4">
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 1000 150"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line
              x1="0"
              y1="0"
              x2="1000"
              y2="0"
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-text4/30 dark:text-darkBorder/30"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="50"
              x2="1000"
              y2="50"
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-text4/30 dark:text-darkBorder/30"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="100"
              x2="1000"
              y2="100"
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-text4/30 dark:text-darkBorder/30"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="150"
              x2="1000"
              y2="150"
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-text4/30 dark:text-darkBorder/30"
              strokeWidth="1"
            />

            {/* Area Fill */}
            <path d={fillPath} fill="url(#revenueGradient)" />

            {/* Line */}
            <path
              d={areaPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {revenueData.map((val, i) => {
              const width = 1000;
              const height = 150;
              const padding = 10;
              const stepX = (width - padding * 2) / (revenueData.length - 1);
              const scaleY = (height - padding * 2) / maxRevenue;
              const x = padding + i * stepX;
              const y = height - padding - val * scaleY;

              return (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2"
                    className="transition-all duration-200 group-hover:r-7"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#2563eb"
                    className="opacity-0 group-hover:opacity-20 transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-4 px-2">
          {months.map((month) => (
            <span key={month} className="text-xs text-text5 font-medium">
              {month}
            </span>
          ))}
        </div>
      </div>

      {/* Sales Performance (Bar Chart) */}
      <div className="rounded-xl border border-text4/30 dark:border-darkBorder/50 bg-white dark:bg-darkBg p-6 shadow-sm">
        <h4 className="text-base font-semibold text-black dark:text-white mb-6">
          Sales Performance
        </h4>

        <div className="flex flex-col gap-4">
          {months.map((month, index) => {
            const val = salesData[index];
            const percentage = (val / maxSales) * 100;

            return (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs font-medium text-text5 w-8">
                  {month}
                </span>
                <div className="flex-1 h-3 bg-gray-100 dark:bg-darkBorder/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 hover:opacity-80"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-black dark:text-white w-8 text-right border border-text4/30 dark:border-darkBorder/40 px-1 rounded">
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
