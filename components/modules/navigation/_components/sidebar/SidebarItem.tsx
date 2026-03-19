"use client";
import Link from "next/link";
import React, { useContext } from "react";
import { HoverContext, isPathActive } from "./SidebarContext";
import { AdminMenuItem } from "@/components/modules/access-control";

export interface SidebarItemProps {
  item: AdminMenuItem;
  pathname: string;
  collapsed: boolean;
  isSubmenu?: boolean;
  hideDot?: boolean;
}

export function SidebarItem({
  item,
  pathname,
  collapsed,
  isSubmenu,
  hideDot,
}: SidebarItemProps) {
  const Icon = item.icon as Extract<typeof item.icon, React.ElementType>;
  const context = useContext(HoverContext);
  const active = isPathActive(pathname, item.path);

  return (
    <div
      className={`relative flex items-center ${collapsed ? "group cursor-pointer" : "gap-2"}`}
      onMouseEnter={(e) =>
        collapsed && !isSubmenu ? context?.setHover(e, item) : undefined
      }
      onMouseLeave={() =>
        collapsed && !isSubmenu ? context?.clearHover() : undefined
      }
    >
      {isSubmenu && !collapsed && !hideDot && (
        <div className="size-2 rounded-full bg-gray-300 dark:bg-darkBorder -ml-1"></div>
      )}

      <Link
        href={item.path || "#"}
        className={[
          "flex flex-1 items-center rounded px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-primary text-white"
            : "text-slate-700 dark:text-text5 hover:bg-slate-100 dark:hover:bg-darkPrimary hover:text-slate-900 dark:hover:text-white",
          collapsed ? "justify-center" : "gap-3",
        ].join(" ")}
      >
        {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
        {!collapsed && <span className="truncate">{item.title}</span>}
      </Link>
    </div>
  );
}
