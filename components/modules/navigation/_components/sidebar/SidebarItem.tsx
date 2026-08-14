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
        <div className="size-2 rounded-full bg-border -ml-1"></div>
      )}

      <Link
        href={item.path || "#"}
        className={[
          "flex flex-1 items-center rounded px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-primary text-white"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed ? "justify-center" : "gap-3",
        ].join(" ")}
      >
        {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
        {!collapsed && <span className="truncate">{item.title}</span>}
      </Link>
    </div>
  );
}
