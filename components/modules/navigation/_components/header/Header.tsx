"use client";

import { ThemeToggle } from "@/components/ui";
import { Menu } from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NotificationNav } from "./NotificationNav";
import { ProfileDropdown } from "./ProfileDropdown";
import { useSidebar } from "@/components/modules/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  return (
    <header className="sticky top-0 z-30 flex h-[69px] items-center justify-between gap-2 border-b border-gray-200 bg-white/80 backdrop-blur-md px-3 sm:px-5 dark:border-darkBorder dark:bg-darkBg transition-all">
      {/* Left section: Mobile Menu & Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={cn(
              "relative size-9 rounded-[11px] center cursor-pointer md:hidden",
              "bg-gray-light dark:bg-darkPrimary hover:bg-gray-medium/20 dark:hover:bg-primary/20",
              "border border-border dark:border-darkBorder hover:border-border/70 dark:hover:border-primary/50",
              "transition-all duration-200",
              "text-gray-700 dark:text-gray-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            )}
          >
            <Menu className="size-5" />
          </button>
        </div>

        <GlobalSearchModal />
      </div>

      {/* Right section: Utilities & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />

        {/* Notifications */}
        <NotificationNav />

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
