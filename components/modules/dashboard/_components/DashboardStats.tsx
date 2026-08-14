import {
  PackageIcon,
  DollarSignIcon,
  ShoppingBagIcon,
  UsersOutlineIcon,
  ArrowUpOutlineIcon,
  ArrowDownOutlineIcon,
} from "@/components/icons/Icons";

const stats = [
  {
    title: "Total Revenue",
    value: "$124,500.00",
    change: "+12.5%",
    trend: "up",
    icon: DollarSignIcon,
    color: "from-blue-500 to-indigo-600",
    lightColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    title: "Active Users",
    value: "2,420",
    change: "+18.2%",
    trend: "up",
    icon: UsersOutlineIcon,
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "Total Orders",
    value: "1,150",
    change: "-3.1%",
    trend: "down",
    icon: ShoppingBagIcon,
    color: "from-amber-500 to-orange-600",
    lightColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "Products",
    value: "415",
    change: "+4.4%",
    trend: "up",
    icon: PackageIcon,
    color: "from-purple-500 to-pink-600",
    lightColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {stats.map((item, index) => (
        <div
          key={index}
          className="relative group overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Background Gradient Hover */}
          <div className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground poppins">
                {item.title}
              </p>
              <h3 className="text-2xl poppins font-semibold text-foreground mt-2 tabular-nums">
                {item.value}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${item.lightColor}`}>
              <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
          </div>

          <div className="flex items-center mt-4 pt-4 border-t border-dashed border-border">
            <span
              className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                item.trend === "up"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {item.trend === "up" ? (
                <ArrowUpOutlineIcon className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownOutlineIcon className="w-3 h-3 mr-1" />
              )}
              {item.change}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              vs last month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
