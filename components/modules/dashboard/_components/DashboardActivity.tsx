import { ArrowRightIcon } from "lucide-react";

export default function DashboardActivity() {
  const recentOrders = [
    {
      id: "#ORD-7382",
      customer: "Amir Khan",
      date: "Jan 12, 2026",
      amount: "$350.00",
      status: "Delivered",
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      id: "#ORD-7381",
      customer: "Sara Ali",
      date: "Jan 12, 2026",
      amount: "$120.50",
      status: "Pending",
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      id: "#ORD-7380",
      customer: "John Doe",
      date: "Jan 11, 2026",
      amount: "$89.99",
      status: "Processing",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      id: "#ORD-7379",
      customer: "Emma Stone",
      date: "Jan 11, 2026",
      amount: "$540.00",
      status: "Delivered",
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      id: "#ORD-7380",
      customer: "John Doe",
      date: "Jan 11, 2026",
      amount: "$89.99",
      status: "Processing",
      color: "bg-blue-500/10 text-blue-500",
    },
  ];

  const activities = [
    {
      text: "New wholesaler 'Green Grocers' joined.",
      type: "system",
      time: "5 mins ago",
      dot: "bg-blue-500",
    },
    {
      text: "Low stock alert: 'Organic Apples' (5 left).",
      type: "system",
      time: "12 mins ago",
      dot: "bg-rose-500",
    },
    {
      text: "Payout of $5,000 processed for 'Fruit Vendor Inc'.",
      type: "system",
      time: "45 mins ago",
      dot: "bg-emerald-500",
    },
    {
      text: "System update applied successfully (v2.1.2).",
      type: "system",
      time: "2 hours ago",
      dot: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
      {/* Recent Orders */}
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-3 sm:p-5 sm:pb-2 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-base font-semibold text-foreground">
            Recent Orders
          </h4>
          <button className="flex items-center text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
            View All
            <ArrowRightIcon className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto noBar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[22%] py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Order ID
                </th>
                <th className="w-[35%] py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="w-[23%] py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="w-[20%] py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-accent transition-colors duration-150"
                >
                  <td className="py-3 text-sm font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {order.customer}
                  </td>
                  <td className="py-3 text-sm font-semibold text-foreground">
                    {order.amount}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${order.color}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-6  flex flex-col">
        <h4 className="text-base font-semibold text-foreground mb-5">
          Latest Activity
        </h4>

        <div className="relative flex-1">
          {/* Vertical Line */}
          <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border" />

          <div className="flex flex-col gap-6 pl-6 relative">
            {activities.map((activity, index) => (
              <div key={index} className="relative flex items-start gap-3">
                <div
                  className={`absolute -left-[22.5px] top-1.5 w-3 h-3 rounded-full ${activity.dot} border-2 border-card ring-4 ring-card`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activity.text}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
