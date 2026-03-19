"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";

export function ProfileDropdown() {
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
    <div className="relative pl-1 sm:pl-2" ref={dropdownRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center gap-2 rounded-full p-0.5 sm:pl-0.5 sm:pr-5 border border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer outline-none"
      >
        <div className="sm:size-9 size-8 rounded-full bg-gray-light dark:bg-darkPrimary flex items-center justify-center text-gray-700 dark:text-white text-xs font-medium shadow-sm ring-2 ring-white dark:ring-black">
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

      <div
        className={`absolute right-0 mt-3 w-54 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg shadow-slate-200/50 dark:shadow-none origin-top-right overflow-hidden flex flex-col transition-all duration-200 ease-out z-50 ${
          isProfileOpen
            ? "opacity-100 scale-100 visible pointer-events-auto"
            : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Admin User
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            admin@retwho.com
          </p>
        </div>

        <div className="p-1.5 space-y-0.5">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            My Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Account Settings
          </Link>
        </div>

        <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
          <button className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
