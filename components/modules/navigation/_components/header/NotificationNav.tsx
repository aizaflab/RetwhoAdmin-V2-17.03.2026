"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  PackageCheck,
  Truck,
  UserPlus,
  Package,
  MessageSquare,
  Tag,
  ShieldAlert,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Users,
  Star,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    type: "orders",
    title: "Order Confirmed",
    message: "Your order #12345 has been confirmed and is being processed",
    time: "2 min ago",
    read: false,
    icon: PackageCheck,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    borderColor: "border-emerald-500/20",
    glowColor: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  },
  {
    id: 2,
    type: "orders",
    title: "Order Shipped",
    message: "Your order #12344 has been shipped and is on the way",
    time: "1 hour ago",
    read: false,
    icon: Truck,
    iconColor: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    borderColor: "border-blue-500/20",
    glowColor: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  {
    id: 3,
    type: "connect",
    title: "New Follower",
    message: "John Doe started following you",
    time: "3 hours ago",
    read: true,
    icon: UserPlus,
    iconColor: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    borderColor: "border-purple-500/20",
    glowColor: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  },
  {
    id: 4,
    type: "orders",
    title: "Order Delivered",
    message: "Your order #12343 has been delivered successfully",
    time: "1 day ago",
    read: true,
    icon: Package,
    iconColor: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-500/20",
    borderColor: "border-orange-500/20",
    glowColor: "shadow-[0_0_15px_rgba(249,115,22,0.3)]",
  },
  {
    id: 5,
    type: "messages",
    title: "New Message",
    message: "You have a new message from Sarah",
    time: "2 days ago",
    read: true,
    icon: MessageSquare,
    iconColor: "text-pink-500 dark:text-pink-400",
    bgColor: "bg-pink-500/10 dark:bg-pink-500/20",
    borderColor: "border-pink-500/20",
    glowColor: "shadow-[0_0_15px_rgba(236,72,153,0.3)]",
  },
  {
    id: 6,
    type: "promotions",
    title: "Special Offer!",
    message: "Get 20% off on your next purchase. Limited time only!",
    time: "3 days ago",
    read: false,
    icon: Tag,
    iconColor: "text-yellow-500 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 dark:bg-yellow-500/20",
    borderColor: "border-yellow-500/20",
    glowColor: "shadow-[0_0_15px_rgba(234,179,8,0.3)]",
  },
  {
    id: 7,
    type: "alerts",
    title: "Security Alert",
    message: "New login detected from a different device",
    time: "4 days ago",
    read: true,
    icon: ShieldAlert,
    iconColor: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-500/20",
    borderColor: "border-red-500/20",
    glowColor: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
  },
  {
    id: 8,
    type: "updates",
    title: "App Update Available",
    message: "Version 2.0 is now available with new features",
    time: "5 days ago",
    read: true,
    icon: RefreshCw,
    iconColor: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
    borderColor: "border-indigo-500/20",
    glowColor: "shadow-[0_0_15px_rgba(99,102,241,0.3)]",
  },
];

const tabs = [
  { id: "all", label: "All", icon: Bell },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "connect", label: "Connect", icon: Users },
  { id: "updates", label: "Updates", icon: Star },
  { id: "promotions", label: "Promotions", icon: Tag },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
];

export function NotificationNav() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll left/right
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Check scroll on mount and when dropdown opens
  useEffect(() => {
    if (openDropdown) {
      setTimeout(checkScroll, 100);

      // Update dimensions on window resize
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [openDropdown]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Icon Button */}
      <button
        aria-label="Notifications"
        className={cn(
          "relative size-8 rounded-[11px] center cursor-pointer",
          "bg-gray-light dark:bg-darkPrimary hover:bg-gray-medium/20 dark:hover:bg-primary/20",
          "border border-border dark:border-darkBorder hover:border-border/70 dark:hover:border-primary/50",
          "transition-all duration-200",
          "text-gray-700 dark:text-white",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
        onClick={() => setOpenDropdown(!openDropdown)}
      >
        <Bell className="h-5 w-5 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
        )}
      </button>

      {/* Dropdown Panel */}

      <div
        className={`absolute sm:right-0 -right-16 top-[50px] w-[370px] sm:w-[420px] bg-white dark:bg-slate-900/80 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-gray-200/70 dark:border-white/10 z-50 overflow-hidden origin-top-right transition-all duration-200 ease-out ${
          openDropdown
            ? "opacity-100 translate-y-0 visible pointer-events-auto"
            : "opacity-0 translate-y-2 invisible pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="relative px-5 py-3.5 border-b border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          {/* Header Background Glow */}
          <div className="absolute top-0 left-0 w-full h-[200px] bg-blue-500/5  rounded-t-xl pointer-events-none -z-10"></div>

          <div className="flex items-center justify-between  relative z-10">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md cursor-pointer"
              >
                <Check className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 relative z-10">
            You have{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {unreadCount}
            </span>{" "}
            unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-5 py-3 border-b border-slate-200/50 dark:border-slate-800/50 relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-[47%] -translate-y-1/2 z-20 h-7 w-7 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 text-slate-700 dark:text-slate-300 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-[47%] -translate-y-1/2 z-20 h-7 w-7 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 text-slate-700 dark:text-slate-300 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white "
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <IconComponent
                    className={`h-3.5 w-3.5 ${isActive ? "text-white" : ""}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        <div className="sm:max-h-[380px] max-h-[300px] custom-scroll pl-1.5 [scrollbar-gutter:stable] overflow-hidden hover:overflow-y-auto ">
          {filteredNotifications.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredNotifications.map((notification) => {
                const NotificationIcon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`relative group p-3 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                      !notification.read
                        ? "bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-100/80 dark:hover:bg-blue-500/10"
                        : "hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    {/* Animated gradient border for unread */}
                    {!notification.read && (
                      <div className="absolute inset-0 rounded-lg border border-blue-200 dark:border-blue-500/30 opacity-100 transition-opacity"></div>
                    )}

                    <div className="flex gap-3 relative z-10">
                      {/* Icon Wrapper */}
                      <div
                        className={`h-10 w-10 mt-0.5 rounded-full ${notification.bgColor} flex items-center justify-center shrink-0 border ${notification.borderColor} transition-transform duration-300 group-hover:scale-110 group-hover:${notification.glowColor}`}
                      >
                        <NotificationIcon
                          className={`h-5 w-5 ${notification.iconColor}`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`text-sm font-semibold line-clamp-1 transition-colors ${
                              !notification.read
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
                <Bell className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                No notifications
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You&apos;re all caught up! Check back later.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
            <button className="w-full cursor-pointer py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-linear-to-r hover:from-slate-800 hover:to-slate-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 hover:border-transparent rounded-md transition-all duration-300">
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
