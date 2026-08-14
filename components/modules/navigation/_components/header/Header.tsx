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
    <header className="sticky top-0 z-30 flex h-[69px] items-center justify-between gap-2 border-b border-border bg-card/80 text-card-foreground backdrop-blur-md px-3 sm:px-5 transition-all">
      {/* Left section: Mobile Menu & Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={cn(
              "relative size-9 rounded-[11px] center cursor-pointer md:hidden",
              "bg-muted hover:bg-accent",
              "border border-border hover:border-primary/50",
              "transition-all duration-200",
              "text-foreground",
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
        <div className="h-6 w-px bg-border hidden sm:block"></div>

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
