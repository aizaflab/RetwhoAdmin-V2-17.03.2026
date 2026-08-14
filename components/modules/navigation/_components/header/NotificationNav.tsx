"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/15",
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
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/15",
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
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/15",
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
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/15",
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
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/15",
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
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-500/15",
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
    iconColor: "text-red-500",
    bgColor: "bg-red-500/15",
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
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/15",
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
      <div>
        <button
          aria-label="Notifications"
          className={cn(
            "relative size-9 rounded-[11px] center cursor-pointer",
            "bg-muted hover:bg-accent",
            "border border-border hover:border-primary/50",
            "transition-all duration-200",
            "text-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
          onClick={() => setOpenDropdown(!openDropdown)}
        >
          <Bell className="h-5 w-5 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Dropdown Panel */}

      <div
        className={`absolute sm:right-0 -right-16 top-[50px] w-[370px] sm:w-[420px] rounded-xl shadow-xl border border-border bg-popover text-popover-foreground z-50 overflow-hidden origin-top-right transition-all duration-200 ease-out ${
          openDropdown
            ? "opacity-100 translate-y-0 visible pointer-events-auto"
            : "opacity-0 translate-y-2 invisible pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="relative px-5 py-3.5 border-b border-border overflow-hidden">
          {/* Header Background Glow */}
          <div className="absolute top-0 left-0 w-full h-[200px] bg-primary/5 rounded-t-xl pointer-events-none -z-10"></div>

          <div className="flex items-center justify-between  relative z-10">
            <h3 className="text-lg font-semibold text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:opacity-80 font-medium transition-colors bg-primary/10 px-2 py-1 rounded-md cursor-pointer"
              >
                <Check className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground relative z-10">
            You have{" "}
            <span className="font-semibold text-primary">{unreadCount}</span>{" "}
            unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-5 py-3 border-b border-border relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-[47%] -translate-y-1/2 z-20 h-7 w-7 bg-card/90 backdrop-blur-md border border-border rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 text-foreground cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-[47%] -translate-y-1/2 z-20 h-7 w-7 bg-card/90 backdrop-blur-md border border-border rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 text-foreground cursor-pointer"
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
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border"
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5" />
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
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    {/* Animated gradient border for unread */}
                    {!notification.read && (
                      <div className="absolute inset-0 rounded-lg border border-primary/30 opacity-100 transition-opacity"></div>
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
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1.5 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-muted-foreground">
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
              <div className="h-16 w-16 mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
                <Bell className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground">
                You&apos;re all caught up! Check back later.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/50 backdrop-blur-md">
            <Link
              href="/notifications"
              onClick={() => setOpenDropdown(false)}
              className="w-full block text-center cursor-pointer py-2.5 text-xs font-semibold text-foreground bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-transparent rounded-md transition-all duration-300"
            >
              View All Notifications
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
