"use client";
import { SidebarItem } from "./SidebarItem";
import React, { useState, useContext } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { HoverContext, hasActiveChild } from "./SidebarContext";
import { AdminMenuItem } from "@/components/modules/access-control";

export interface SidebarGroupProps {
  item: AdminMenuItem;
  pathname: string;
  collapsed: boolean;
}

export function SidebarGroup({ item, pathname, collapsed }: SidebarGroupProps) {
  const Icon = item.icon as Extract<typeof item.icon, React.ElementType>;
  const childActive = hasActiveChild(pathname, item.children);
  const [open, setOpen] = useState(childActive);
  const context = useContext(HoverContext);

  if (!item.children?.length) return null;

  if (collapsed) {
    return (
      <div
        className="relative group"
        onMouseEnter={(e) => context?.setHover(e, item)}
        onMouseLeave={() => context?.clearHover()}
      >
        <button
          type="button"
          className={[
            "flex w-full items-center justify-center rounded px-3 py-2.5 transition-all outline-none cursor-pointer",
            open || childActive
              ? "bg-slate-100 dark:bg-darkPrimary text-black  dark:text-white"
              : "text-black/70 dark:text-text5 hover:bg-slate-100 dark:hover:bg-darkPrimary hover:text-black dark:hover:text-white",
          ].join(" ")}
        >
          {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex w-full items-center justify-between rounded px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
          open || childActive
            ? "bg-slate-100 dark:bg-darkBorder/70 text-black dark:text-white"
            : "text-black/70 dark:text-text5 hover:bg-slate-100 dark:hover:bg-darkBorder/70 dark:hover:text-white hover:text-black",
        ].join(" ")}
      >
        <span className="flex min-w-0 items-center gap-3">
          {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
          <span className="truncate">{item.title}</span>
        </span>

        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
      </button>

      <div
        className={[
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="ml-5 pt-2 space-y-1 border-l border-slate-200 dark:border-darkBorder ">
            {item.children.map((child) => (
              <SidebarItem
                key={child.id}
                item={child}
                pathname={pathname}
                collapsed={false}
                isSubmenu
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
