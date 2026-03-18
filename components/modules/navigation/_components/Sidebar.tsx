"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Link2,
  ShoppingCart,
  FileText,
  Boxes,
  Wallet,
  Settings,
  Megaphone,
  ShieldCheck,
  Store,
  Headphones,
  NotebookPen,
  BriefcaseBusiness,
  BadgeHelp,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { ADMIN_MENU } from "../_config/admin-menu";
import {
  AdminMenuItem,
  filterMenuByAccess,
  useCurrentAccess,
} from "../../access-control";

type IconType = React.ComponentType<{ className?: string }>;

const iconMap: Record<string, IconType> = {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Link2,
  ShoppingCart,
  FileText,
  Boxes,
  Wallet,
  Settings,
  Megaphone,
  ShieldCheck,
  Store,
  Headphones,
  NotebookPen,
  BriefcaseBusiness,
  BadgeHelp,
};

function getIcon(iconName?: string): IconType | null {
  if (!iconName) return null;
  return iconMap[iconName] ?? null;
}

function isPathActive(pathname: string, itemPath?: string) {
  if (!itemPath) return false;
  if (pathname === itemPath) return true;
  return pathname.startsWith(`${itemPath}/`);
}

function hasActiveChild(pathname: string, children?: AdminMenuItem[]) {
  if (!children?.length) return false;
  return children.some((child) => isPathActive(pathname, child.path));
}

interface SidebarItemProps {
  item: AdminMenuItem;
  pathname: string;
  collapsed: boolean;
}

function SidebarItem({ item, pathname, collapsed }: SidebarItemProps) {
  //   const Icon = getIcon(item.icon);
  const active = isPathActive(pathname, item.path);

  return (
    <Link
      href={item.path || "#"}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        collapsed ? "justify-center px-2" : "",
      ].join(" ")}
      title={collapsed ? item.title : undefined}
    >
      {/* {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null} */}
      icon
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );
}

interface SidebarGroupProps {
  item: AdminMenuItem;
  pathname: string;
  collapsed: boolean;
}

function SidebarGroup({ item, pathname, collapsed }: SidebarGroupProps) {
  const Icon = getIcon(item.icon);
  const childActive = hasActiveChild(pathname, item.children);
  const [open, setOpen] = useState(childActive);

  if (!item.children?.length) return null;

  if (collapsed) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          className={[
            "flex w-full items-center justify-center rounded-xl px-2 py-2.5 transition-all",
            childActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
          ].join(" ")}
          title={item.title}
        >
          {/* {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null} */}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
          childActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")}
      >
        <span className="flex min-w-0 items-center gap-3">
          {/* {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null} */}
          <span className="truncate">{item.title}</span>
        </span>

        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
      </button>

      {open && (
        <div className="ml-3 space-y-1 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              pathname={pathname}
              collapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const currentAccess = useCurrentAccess();
  const [collapsed, setCollapsed] = useState(false);

  const allowedMenu = useMemo(() => {
    return filterMenuByAccess(ADMIN_MENU, currentAccess);
  }, [currentAccess]);

  return (
    <aside
      className={[
        "sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
        collapsed ? "w-[88px]" : "w-[280px]",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center border-b border-slate-200 px-4 py-4",
          collapsed ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-900">
              Admin Panel
            </h2>
            <p className="truncate text-xs text-slate-500">
              Role based navigation
            </p>
          </div>
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

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-2">
          {allowedMenu.map((item) => {
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
    </aside>
  );
}
