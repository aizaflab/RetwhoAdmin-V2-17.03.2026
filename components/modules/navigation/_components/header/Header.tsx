"use client";

import React, { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ui";
import { Menu, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NotificationNav } from "./NotificationNav";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 dark:border-slate-800 dark:bg-black/80 transition-all">
      {/* Left section: Mobile Menu & Search */}
      <div className="flex flex-1 items-center gap-4">
        <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer outline-none">
          <Menu className="h-5 w-5" />
        </button>

        <GlobalSearchModal />
      </div>

      {/* Right section: Utilities & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />

        {/* Notifications */}
        <NotificationNav />

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative pl-1 sm:pl-2" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-full p-1 sm:pl-2 sm:pr-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-black">
              AD
            </div>
            <div className="hidden sm:flex flex-col items-start overflow-hidden">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                Admin User
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Superadmin
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Admin User
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  admin@retwho.com
                </p>
              </div>

              <div className="p-1 space-y-0.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Account Settings
                </Link>
              </div>

              <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                <button className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
