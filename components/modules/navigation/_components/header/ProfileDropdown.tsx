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
        className="flex items-center gap-2 rounded-full p-0.5 sm:pl-0.5 sm:pr-5 border transition-all cursor-pointer outline-none group dark:bg-darkBorder/30 hover:bg-gray-mid dark:hover:bg-darkBorder/40 border-slate-200 dark:border-darkBorder "
      >
        <div className="sm:size-9 size-8 rounded-full center text-xs font-medium shadow-sm bg-gray-light dark:bg-darkBorder/60 text-text6 dark:text-white ">
          AD
        </div>
        <div className="hidden sm:flex flex-col items-start overflow-hidden">
          <span className="text-sm font-semibold leading-tight text-text6 dark:text-white/80">
            Admin User
          </span>
          <span className="text-[10px] leading-tight  text-slate-500 dark:text-text5">
            Superadmin
          </span>
        </div>
      </button>

      <div
        className={`absolute right-0 mt-3 w-54 border  rounded-lg shadow-lg shadow-slate-200/50 dark:shadow-none origin-top-right overflow-hidden flex flex-col transition-all duration-200 ease-out z-50 bg-white dark:bg-darkBg  border-border/70 dark:border-darkBorder ${
          isProfileOpen
            ? "opacity-100 scale-100 visible pointer-events-auto"
            : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <div className="px-4 py-2.5 border-b border-border/50 dark:border-darkBorder/40 bg-gray-mid dark:bg-darkPrimary">
          <p className="text-sm font-semibold">Admin User</p>
          <p className="text-xs truncate text-text5">admin@retwho.com</p>
        </div>

        <div className="p-1.5 space-y-0.5">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-text6 dark:text-text4 hover:bg-gray-mid dark:hover:bg-darkPrimary"
          >
            <User className="h-4 w-4 text-text5" />
            My Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-text6 dark:text-text4 hover:bg-gray-mid dark:hover:bg-darkPrimary"
          >
            <Settings className="h-4 w-4 text-text5" />
            Account Settings
          </Link>
        </div>

        <div className="p-1.5 border-t border-border/50 dark:border-darkBorder/60">
          <button className="flex items-center w-full cursor-pointer  gap-3 px-3 py-2 text-sm  rounded-md transition-colors text-red-600 dark:text-red-400 hover:bg-red-100 bg-red-50 dark:bg-red-900/50 dark:hover:bg-red-900/30">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
