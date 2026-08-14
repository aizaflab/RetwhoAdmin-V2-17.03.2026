"use client";

import {
  AdminMenuItem,
  useCurrentAccess,
  filterMenuByAccess,
} from "@/components/modules/access-control";

import Link from "next/link";
import Image from "next/image";
import { SidebarItem } from "./SidebarItem";
import { SidebarGroup } from "./SidebarGroup";
import { usePathname } from "next/navigation";
import { GlobalTooltip } from "./GlobalTooltip";
import logoImg from "@/public/img/logo/logo.svg";
import React, { useMemo, useState, useRef } from "react";
import { HoverContext, HoverState } from "./SidebarContext";
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ShoppingBag,
  PackagePlus,
  ClipboardCheck,
} from "lucide-react";
import { ADMIN_MENU } from "@/components/modules/navigation/_config/admin-menu";
import { useSidebar } from "@/components/modules/navigation";
import { cn } from "@/lib/utils";

const MOCK_ACTIVITIES = [
  {
    title: "New order placed",
    desc: "Order #4092 received just now.",
    icon: ShoppingBag,
    color: "text-emerald-500",
    bg: "bg-emerald-500/15",
    dot: "bg-emerald-500",
  },
  {
    title: "Product Published",
    desc: "Samsung S24 Ultra is live.",
    icon: PackagePlus,
    color: "text-blue-500",
    bg: "bg-blue-500/15",
    dot: "bg-blue-500",
  },
  {
    title: "Task Completed",
    desc: "Employee verified user request.",
    icon: ClipboardCheck,
    color: "text-purple-500",
    bg: "bg-purple-500/15",
    dot: "bg-purple-500",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const currentAccess = useCurrentAccess();
  const {
    isCollapsed: collapsed,
    setIsCollapsed: setCollapsed,
    isMobileOpen,
    setIsMobileOpen,
  } = useSidebar();

  const [hoverState, setHoverState] = useState<HoverState>({
    item: null,
    rect: null,
    isHovered: false,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activityIdx, setActivityIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  React.useEffect(() => {
    if (collapsed) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActivityIdx((prev) => (prev + 1) % MOCK_ACTIVITIES.length);
        setIsAnimating(false);
      }, 300); // 300ms for slide-out animation
    }, 5000);

    return () => clearInterval(interval);
  }, [collapsed]);

  const setHover = (e: React.MouseEvent, item: AdminMenuItem) => {
    if (!collapsed) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const bounds = e.currentTarget.getBoundingClientRect();
    setHoverState({ item, rect: bounds, isHovered: true });
  };

  const clearHover = () => {
    if (!collapsed) return;
    timeoutRef.current = setTimeout(() => {
      setHoverState((prev) => ({ ...prev, isHovered: false }));
    }, 200);
  };

  const keepHover = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const allowedMenu = useMemo(() => {
    return filterMenuByAccess(ADMIN_MENU, currentAccess);
  }, [currentAccess]);

  return (
    <HoverContext.Provider value={{ setHover, clearHover }}>
      <>
        {/* Overlay for mobile (< md) */}

        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden transition-all duration-300 ${isMobileOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Spacer for layout */}
        <div
          className={`shrink-0 transition-all duration-300 hidden md:block ${
            collapsed ? "w-[80px]" : "w-[80px] lg:w-[270px]"
          }`}
        />

        <aside
          className={`fixed top-0 bottom-0 left-0 z-100 flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ${
            collapsed ? "w-[270px] md:w-[80px]" : "w-[270px]"
          } ${
            !isMobileOpen
              ? "-translate-x-full md:translate-x-0"
              : "translate-x-0"
          }`}
        >
          <div
            className={[
              "flex items-center border-b border-border px-4 h-[69px]",
              collapsed ? "justify-center" : "justify-between",
            ].join(" ")}
          >
            {!collapsed && (
              <Link href="/">
                <Image
                  src={logoImg}
                  alt="Retwho"
                  className="h-14 w-fit mx-auto"
                />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="rounded-lg border border-border p-2 text-foreground transition hover:bg-accent cursor-pointer hidden md:flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "relative md:hidden size-8 rounded-[11px] flex items-center justify-center cursor-pointer ",
                "bg-muted hover:bg-accent",
                "border border-border hover:border-primary/50",
                "transition-all duration-200",
                "text-foreground",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <X className="size-[18px]" />
            </button>
          </div>

          <div className="custom-scroll flex-1 px-3 py-4 [scrollbar-gutter:stable] md:overflow-hidden md:hover:overflow-y-auto overflow-y-auto">
            <nav className="space-y-2">
              {allowedMenu.map((item) => {
                if (item.type === "label") {
                  return (
                    <div
                      key={item.id}
                      className={`my-3 flex items-center transition-all ${collapsed ? "justify-center" : "px-3 gap-3"}`}
                      title={collapsed ? item.title : undefined}
                    >
                      {collapsed ? (
                        <span className="text-[10px] font-bold text-muted-foreground tracking-widest">
                          •••
                        </span>
                      ) : (
                        <>
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap truncate">
                            {item.title}
                          </span>
                          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent mt-0.5"></div>
                        </>
                      )}
                    </div>
                  );
                }

                if (item.type === "item") {
                  return (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      pathname={pathname}
                      collapsed={collapsed}
                    />
                  );
                }

                return (
                  <SidebarGroup
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                  />
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border p-3 py-2.5 bg-card">
            <div
              className={cn(
                "group relative overflow-hidden rounded-lg bg-background border border-border p-3  transition-all",
                collapsed ? "hidden" : "block",
              )}
            >
              <div className="absolute top-2.5 right-2.5 flex size-1.5">
                <span
                  className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    MOCK_ACTIVITIES[activityIdx].dot,
                  )}
                ></span>
                <span
                  className={cn(
                    "relative inline-flex rounded-full size-1.5",
                    MOCK_ACTIVITIES[activityIdx].dot,
                  )}
                ></span>
              </div>

              <div
                className={cn(
                  "flex gap-2.5 items-start relative z-10 w-full pr-4 transition-all duration-300 transform",
                  isAnimating
                    ? "opacity-0 translate-y-2 scale-95"
                    : "opacity-100 translate-y-0 scale-100",
                )}
              >
                <div
                  className={cn(
                    "shrink-0 flex items-center justify-center size-8 rounded-lg shadow-xs transition-colors duration-300",
                    MOCK_ACTIVITIES[activityIdx].bg,
                    MOCK_ACTIVITIES[activityIdx].color,
                  )}
                >
                  {(() => {
                    const Icon = MOCK_ACTIVITIES[activityIdx].icon;
                    return <Icon className="size-4" />;
                  })()}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="text-[12px] font-semibold text-foreground leading-tight truncate transition-colors duration-300">
                    {MOCK_ACTIVITIES[activityIdx].title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5 transition-colors duration-300">
                    {MOCK_ACTIVITIES[activityIdx].desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Collapsed state */}
            {collapsed && (
              <div className="flex flex-col items-center justify-center mt-auto mb-1">
                <div
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-xl border border-border transition-all duration-300",
                    MOCK_ACTIVITIES[activityIdx].bg,
                    MOCK_ACTIVITIES[activityIdx].color,
                    isAnimating
                      ? "opacity-0 scale-75"
                      : "opacity-100 scale-100",
                  )}
                  title={MOCK_ACTIVITIES[activityIdx].title}
                >
                  {(() => {
                    const Icon = MOCK_ACTIVITIES[activityIdx].icon;
                    return <Icon className="size-4" />;
                  })()}
                </div>
              </div>
            )}
          </div>
          <GlobalTooltip
            hoverState={hoverState}
            pathname={pathname}
            keepHover={keepHover}
            clearHover={clearHover}
          />
        </aside>
      </>
    </HoverContext.Provider>
  );
}
