import Link from "next/link";
import Image from "next/image";
import logoImg from "@/public/img/logo/logo.svg";
import type { LoginFeatureItem } from "../_types";
import LoginSidebarFeature from "./LoginSidebarFeature";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from "@/components/icons/Icons";

const FEATURES: LoginFeatureItem[] = [
  {
    icon: UsersIcon,
    title: "Multi-Retailer Management",
    description:
      "Sell to multiple verified retailers through a single, unified platform. Manage bulk orders, set flexible pricing, and track inventory in real time.",
  },
  {
    icon: ChartBarIcon,
    title: "Analytics & Smart Bookkeeping",
    description:
      "Get real-time insights into sales, orders, and trends. Automated invoicing and daily ledger tools keep your finances accurate and stress-free.",
  },
  {
    icon: HomeIcon,
    title: "Multi-Store Control",
    description:
      "Manage all your branches, warehouses, or stores from one powerful dashboard with role-based access control and centralized reporting.",
  },
];

export default function LoginSidebar() {
  return (
    <div className="p-2 hidden h-full lg:block lg:w-95 relative z-10">
      <div className="lg:flex h-full w-full flex-col rounded border bg-white dark:bg-darkPrimary  border-border/50 dark:border-darkBorder">
        <div className="mb-5 px-5 py-2 border-b border-border/50 dark:border-darkBorder">
          {/* Logo */}
          <Link href="/">
            <Image src={logoImg} alt="Retwho" className="h-14 w-fit mx-auto" />
          </Link>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 pt-0 flex flex-col justify-between">
          <div className="space-y-10">
            {/* Headline */}
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white text-black">
                Welcome to Retwho
              </h3>
              <p className="text-sm leading-relaxed text-text4/80">
                The ultimate B2B marketplace connecting wholesalers, retailers,
                and buyers in one powerful hub. Sign in to manage your business,
                orders, and inventory — all from one place.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-5">
              {FEATURES.map((feature) => (
                <LoginSidebarFeature key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5">
          <Link
            href="/"
            className="w-fit text-xs flex items-center gap-1.5 transition-colors text-primary dark:text-darkLight hover:text-black dark:hover:text-white"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to retwho.com
          </Link>
        </div>
      </div>
    </div>
  );
}
