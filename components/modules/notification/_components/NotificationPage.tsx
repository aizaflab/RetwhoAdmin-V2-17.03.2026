"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  ShoppingBag,
  Users,
  Tag,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Star,
  Shield,
  CheckCheck,
  Trash2,
  BellOff,
  Filter,
  SortDesc,
  ExternalLink,
  Pin,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "../_types/notification.types";
import Link from "next/link";

// ── Helpers ────────────────────────────────────────────────────────────────

const getTypeIcon = (type: NotificationType) => {
  const map: Record<NotificationType, React.ElementType> = {
    orders: ShoppingBag,
    connect: Users,
    messages: MessageSquare,
    promotions: Tag,
    alerts: AlertTriangle,
    updates: RefreshCw,
    system: RefreshCw,
    payment: CreditCard,
    review: Star,
    security: Shield,
  };
  return map[type] || Bell;
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "critical":
      return {
        label: "Critical",
        cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      };
    case "high":
      return {
        label: "High",
        cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
      };
    case "medium":
      return {
        label: "Medium",
        cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      };
    default:
      return {
        label: "Low",
        cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      };
  }
};

// ── Tab Config ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "all", label: "All", icon: Bell },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "connect", label: "Connect", icon: Users },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "security", label: "Security", icon: Shield },
  { id: "updates", label: "Updates", icon: RefreshCw },
  { id: "promotions", label: "Promotions", icon: Tag },
  { id: "review", label: "Reviews", icon: Star },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priority", label: "Priority" },
  { value: "unread", label: "Unread First" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Notifications" },
  { value: "unread", label: "Unread Only" },
  { value: "read", label: "Read Only" },
  { value: "pinned", label: "Pinned" },
];

// ── Component ──────────────────────────────────────────────────────────────

interface NotificationPageProps {
  notifications: Notification[];
}

export default function NotificationPage({
  notifications: initialNotifications,
}: NotificationPageProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Derived/Filtered Data ──────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...notifications];

    // Tab filter
    if (activeTab !== "all") {
      list = list.filter((n) => n.type === activeTab);
    }

    // Read filter
    if (filterRead === "unread") list = list.filter((n) => !n.read);
    else if (filterRead === "read") list = list.filter((n) => n.read);
    else if (filterRead === "pinned") list = list.filter((n) => n.pinned);

    // Sort
    if (sortBy === "newest") {
      list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else if (sortBy === "oldest") {
      list.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } else if (sortBy === "priority") {
      const pOrder: Record<string, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      list.sort(
        (a, b) => (pOrder[a.priority] ?? 3) - (pOrder[b.priority] ?? 3),
      );
    } else if (sortBy === "unread") {
      list.sort((a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0));
    }

    // Pinned always on top
    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    return list;
  }, [notifications, activeTab, filterRead, sortBy]);

  // ── Actions ───────────────────────────────────────────────────────────

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  const togglePin = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleBulkMarkRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n)),
    );
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((n) => n.id)));
    }
  };

  // ── Tab Counts ────────────────────────────────────────────────────────

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.filter((n) => !n.read).length,
    };
    TABS.forEach((t) => {
      if (t.id !== "all") {
        counts[t.id] = notifications.filter(
          (n) => n.type === t.id && !n.read,
        ).length;
      }
    });
    return counts;
  }, [notifications]);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      {/* ── Page Header ── */}
      <div className="px-5 py-5 border-b border-border/60 dark:border-darkBorder/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-black dark:text-white">
                  Notifications
                </h1>
                <p className="text-xs text-text5 dark:text-text5 mt-0.5">
                  {unreadCount > 0 ? (
                    <>
                      You have{" "}
                      <span className="text-primary font-semibold">
                        {unreadCount}
                      </span>{" "}
                      unread notification{unreadCount !== 1 ? "s" : ""}
                    </>
                  ) : (
                    "You're all caught up!"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkPrimary text-text6 dark:text-text4 hover:border-primary/40 hover:text-primary transition-all duration-200 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark All Read
              </button>
            )}
            <button
              onClick={() => {
                setBulkMode(!bulkMode);
                setSelectedIds(new Set());
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer",
                bulkMode
                  ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                  : "border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkPrimary text-text6 dark:text-text4 hover:border-primary/40 hover:text-primary",
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              {bulkMode ? "Exit Bulk" : "Bulk Select"}
            </button>
          </div>
        </div>

        {/* ── Bulk Action Bar ── */}
        {bulkMode && selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-primary/20" />
            <button
              onClick={handleBulkMarkRead}
              className="flex items-center gap-1.5 text-xs font-medium text-text6 dark:text-text4 hover:text-primary transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark as Read
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={selectAll}
              className="ml-auto text-xs font-medium text-text5 hover:text-primary transition-colors cursor-pointer"
            >
              {selectedIds.size === filtered.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="px-5 py-3 border-b border-border/40 dark:border-darkBorder/40 overflow-x-auto noBar">
        <div className="flex items-center gap-1.5 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tabCounts[tab.id] || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "bg-gray-light dark:bg-darkPrimary text-text6 dark:text-text5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary border border-border/50 dark:border-darkBorder/50",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "h-4 min-w-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                      isActive
                        ? "bg-white/30 text-white"
                        : "bg-primary/15 text-primary dark:bg-primary/25",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-border/30 dark:border-darkBorder/30">
        <p className="text-xs text-text5">
          Showing{" "}
          <span className="font-semibold text-text6 dark:text-text4">
            {filtered.length}
          </span>{" "}
          notification{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkPrimary text-text6 dark:text-text4 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
            >
              <Filter className="w-3 h-3" />
              {FILTER_OPTIONS.find((o) => o.value === filterRead)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-border/60 dark:border-darkBorder bg-white dark:bg-darkBg shadow-xl shadow-black/10 dark:shadow-black/40 p-1">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilterRead(opt.value);
                      setShowFilterDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs rounded-md transition-colors cursor-pointer",
                      filterRead === opt.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text6 dark:text-text4 hover:bg-gray-light dark:hover:bg-darkPrimary",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkPrimary text-text6 dark:text-text4 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
            >
              <SortDesc className="w-3 h-3" />
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-border/60 dark:border-darkBorder bg-white dark:bg-darkBg shadow-xl shadow-black/10 dark:shadow-black/40 p-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs rounded-md transition-colors cursor-pointer",
                      sortBy === opt.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text6 dark:text-text4 hover:bg-gray-light dark:hover:bg-darkPrimary",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Notification List ── */}
      <div
        className="divide-y divide-border/30 dark:divide-darkBorder/30"
        onClick={() => {
          setShowFilterDropdown(false);
          setShowSortDropdown(false);
        }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-light dark:bg-darkPrimary flex items-center justify-center border border-border/40 dark:border-darkBorder/40">
              <BellOff className="w-9 h-9 text-text4 dark:text-text6" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-text6 dark:text-text4">
                No notifications found
              </p>
              <p className="text-sm text-text5 mt-1">
                Try adjusting your filters or check back later
              </p>
            </div>
          </div>
        ) : (
          filtered.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            const priority = getPriorityLabel(notification.priority);
            const isSelected = selectedIds.has(notification.id);

            return (
              <div
                key={notification.id}
                className={cn(
                  "group relative flex gap-4 px-5 py-4 transition-all duration-200 cursor-pointer",
                  !notification.read
                    ? "bg-primary/[0.03] dark:bg-primary/[0.06] hover:bg-primary/[0.06] dark:hover:bg-primary/[0.09]"
                    : "hover:bg-gray-light/60 dark:hover:bg-darkPrimary/40",
                  isSelected &&
                    "bg-primary/5 dark:bg-primary/10 ring-1 ring-inset ring-primary/20",
                  notification.pinned && "border-l-2 border-l-primary/40",
                )}
                onClick={() => {
                  if (bulkMode) {
                    toggleSelect(notification.id);
                  } else {
                    markAsRead(notification.id);
                  }
                }}
              >
                {/* Bulk checkbox */}
                {bulkMode && (
                  <div className="flex items-start pt-0.5 shrink-0">
                    <div
                      className={cn(
                        "w-4 h-4 rounded border transition-all",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-border dark:border-darkBorder bg-white dark:bg-darkBg",
                      )}
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 12 12"
                          className="w-full h-full text-white"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "shrink-0 w-10 h-10 rounded-full flex items-center justify-center border mt-0.5 transition-transform duration-300 group-hover:scale-105",
                    notification.bgColor,
                    notification.borderColor,
                  )}
                >
                  <Icon className={cn("w-5 h-5", notification.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={cn(
                          "text-sm font-semibold",
                          !notification.read
                            ? "text-black dark:text-white"
                            : "text-text6 dark:text-text4",
                        )}
                      >
                        {notification.title}
                      </h4>
                      {notification.pinned && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded-full border border-primary/20">
                          <Pin className="w-2.5 h-2.5" />
                          Pinned
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          priority.cls,
                        )}
                      >
                        {priority.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(3,106,161,0.7)] animate-pulse shrink-0" />
                      )}
                      <span className="text-[11px] text-text4 dark:text-text5 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text6 dark:text-text5 mt-1 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {notification.actionLabel && (
                      <Link
                        href={notification.actionUrl || "#"}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {notification.actionLabel}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {notification.metadata?.orderId && (
                      <span className="text-[11px] text-text5 font-mono bg-gray-light dark:bg-darkPrimary px-1.5 py-0.5 rounded">
                        #{notification.metadata.orderId}
                      </span>
                    )}
                    {notification.metadata?.amount && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ৳{notification.metadata.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row actions (hover) */}
                {!bulkMode && (
                  <div className="shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(notification.id);
                      }}
                      title={notification.pinned ? "Unpin" : "Pin"}
                      className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer",
                        notification.pinned
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-light dark:bg-darkPrimary text-text5 hover:text-primary hover:bg-primary/10",
                      )}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete"
                      className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-light dark:bg-darkPrimary text-text5 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-border/30 dark:border-darkBorder/30 flex items-center justify-between">
          <p className="text-xs text-text5">
            {filtered.filter((n) => !n.read).length} unread ·{" "}
            {filtered.filter((n) => n.read).length} read
          </p>
          {notifications.some((n) => n.read) && (
            <button
              onClick={() =>
                setNotifications((prev) => prev.filter((n) => !n.read))
              }
              className="text-xs font-medium text-text5 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear all read
            </button>
          )}
        </div>
      )}
    </div>
  );
}
