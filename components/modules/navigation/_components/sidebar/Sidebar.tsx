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
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ADMIN_MENU } from "@/components/modules/navigation/_config/admin-menu";

export default function Sidebar() {
  const pathname = usePathname();
  const currentAccess = useCurrentAccess();
  const [collapsed, setCollapsed] = useState(false);

  const [hoverState, setHoverState] = useState<HoverState>({
    item: null,
    rect: null,
    isHovered: false,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      <aside
        className={[
          "sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
          collapsed ? "w-[80px]" : "w-[280px]",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center border-b border-slate-200 px-4 py-2",
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
            className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="custom-scroll flex-1 px-3 py-4 [scrollbar-gutter:stable] overflow-hidden hover:overflow-y-auto">
          <nav className="space-y-2">
            {allowedMenu.map((item) => {
              if (item.type === "label") {
                return (
                  <div
                    key={item.id}
                    className={`mt-3 mb-1 flex items-center transition-all ${collapsed ? "justify-center" : "px-3 gap-3"}`}
                    title={collapsed ? item.title : undefined}
                  >
                    {collapsed ? (
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 tracking-widest">
                        •••
                      </span>
                    ) : (
                      <>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap truncate">
                          {item.title}
                        </span>
                        <div className="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent dark:from-slate-700/50 mt-0.5"></div>
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

        <div className="border-t border-slate-200 p-3">
          <div
            className={[
              "rounded-xl bg-slate-50 p-3 text-xs text-slate-600",
              collapsed ? "hidden" : "block",
            ].join(" ")}
          >
            Signed in with controlled access permissions.
          </div>
        </div>
        <GlobalTooltip
          hoverState={hoverState}
          pathname={pathname}
          keepHover={keepHover}
          clearHover={clearHover}
        />
      </aside>
    </HoverContext.Provider>
  );
}
