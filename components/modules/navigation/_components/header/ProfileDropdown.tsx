"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut, User, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

import { useLogout } from "@/hooks/useLogout";
import { useGetProfileQuery } from "@/featured/user/userApiSlice";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

type Profile = {
  _id: string;
  name?: string;
  email?: string;
  // Populated by the server, so this is the role document rather than an id.
  roleId?: { _id: string; name?: string };
  status?: string;
};

/** "Shafik Islam" -> "SI", "Shafik" -> "SH" */
const getInitials = (name?: string) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function ProfileDropdown() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { handleLogout, isSigningOut } = useLogout();
  const { data: profile, isLoading } = useGetProfileQuery(undefined) as {
    data?: Profile;
    isLoading: boolean;
  };

  const displayName = profile?.name ?? "Admin User";
  const displayEmail = profile?.email ?? "";
  const displayRole = profile?.roleId?.name ?? "";

  const onSignOut = async () => {
    setIsProfileOpen(false);
    await handleLogout();
  };

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
        className="flex items-center gap-2 rounded-full p-0.5 sm:pl-0.5 sm:pr-5 border border-border bg-muted/50 hover:bg-accent transition-all cursor-pointer outline-none group"
      >
        {isLoading ? (
          <Skeleton shape="circle" className="sm:size-9 size-8 shrink-0" />
        ) : (
          <div className="sm:size-9 size-8 rounded-full center text-xs font-medium shadow-sm bg-muted text-foreground">
            {getInitials(profile?.name)}
          </div>
        )}

        {isLoading ? (
          <div className="hidden sm:flex flex-col items-start gap-1.5">
            <Skeleton shape="text" className="h-3 w-24" />
            <Skeleton shape="text" className="h-2 w-16" />
          </div>
        ) : (
          <div className="hidden sm:flex flex-col items-start overflow-hidden">
            <span className="text-sm font-semibold leading-tight text-foreground">
              {displayName}
            </span>
            <span className="text-[10px] leading-tight text-muted-foreground">
              {displayRole || displayEmail}
            </span>
          </div>
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-54 border border-border rounded-lg shadow-lg origin-top-right overflow-hidden flex flex-col transition-all duration-200 ease-out z-50 bg-popover text-popover-foreground ${
          isProfileOpen
            ? "opacity-100 scale-100 visible pointer-events-auto"
            : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <div className="px-4 py-2.5 border-b border-border bg-muted">
          {isLoading ? (
            <div className="flex flex-col gap-1.5 py-1">
              <Skeleton shape="text" className="h-3 w-28" />
              <Skeleton shape="text" className="h-2.5 w-36" />
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs truncate text-muted-foreground">
                {displayEmail}
              </p>
            </>
          )}
        </div>

        <div className="p-1.5 space-y-0.5">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            My Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Account Settings
          </Link>
        </div>

        <div className="p-1.5 border-t border-border">
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="flex items-center w-full cursor-pointer gap-3 px-3 py-2 text-sm rounded-md transition-colors text-destructive bg-destructive/10 hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
