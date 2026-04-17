"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Shield,
  Building2,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Activity,
  Package,
  Star,
  User,
  LogIn,
  MoreHorizontal,
  UserX,
  TrendingUp,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PROFILE_INFO,
  PROFILE_STATS,
  RECENT_ACTIVITY,
  PROFILE_PERMISSIONS,
  LINKED_ACCOUNTS,
} from "../../_data/settings.data";
import { LinkedAccount } from "../../_types/profile.types";

// ── Icon resolver ──────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  CheckCircle2,
  Shield,
  Package,
  Star,
  Globe,
  Activity,
  User,
};

// ── Role badge ─────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  super_admin:
    "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
  admin:
    "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400",
  manager:
    "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
  viewer:
    "bg-slate-500/10 text-slate-600 border-slate-400/20 dark:bg-slate-700 dark:text-slate-400",
};

// ── Linked Account Card ────────────────────────────────────────────────────

function LinkedAccountCard({
  account,
  onSwitch,
  onRevoke,
}: {
  account: LinkedAccount;
  onSwitch: (id: string) => void;
  onRevoke: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative flex items-center gap-3 p-3.5 rounded-lg border border-border/40 dark:border-darkBorder/40 bg-white dark:bg-darkBg hover:border-primary/25 dark:hover:border-primary/30 hover:shadow-sm transition-all duration-200">
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm",
          account.color,
        )}
      >
        {account.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-text6 dark:text-text4 truncate">
            {account.name}
          </p>
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
              ROLE_STYLES[account.roleLevel],
            )}
          >
            {account.role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text5 flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5" />
            {account.department}
          </span>
          <span className="text-text4">·</span>
          <span
            className={cn(
              "text-[10px] font-medium flex items-center gap-1",
              account.isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-text5",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                account.isActive
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-slate-400 dark:bg-slate-600",
              )}
            />
            {account.lastSeen}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onSwitch(account.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-border/60 dark:border-darkBorder text-text6 dark:text-text4 hover:border-primary/40 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer"
        >
          <LogIn className="w-3 h-3" />
          Switch
        </button>
        <div className="relative">
          <button
            onClick={() => {
              onRevoke(account.id);
              setMenuOpen(false);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-red-500/50 dark:border-red-500/30 text-text5 hover:text-text6 dark:hover:text-text4 hover:bg-gray-light dark:hover:bg-darkPrimary transition-all cursor-pointer"
          >
            <UserX className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProfileTab() {
  const [linkedAccounts, setLinkedAccounts] = useState(LINKED_ACCOUNTS);

  const handleRevoke = (id: string) => {
    setLinkedAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSwitch = (id: string) => {
    // In a real app: switch to that account's session
    console.log("Switch to account:", id);
  };

  return (
    <div className="space-y-5">
      {/* ── Identity Card ── (no cover, clean) */}
      <div className="rounded-lg border border-border/40 dark:border-darkBorder/40 bg-gray-light/40 dark:bg-darkPrimary/30 overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-darkPrimary border border-primary/20 dark:border-darkBorder/60 flex items-center justify-center shadow-md">
                <span className="text-xl font-semibold text-primary dark:text-darkLight">
                  {PROFILE_INFO.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
            </div>

            {/* Core Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-black dark:text-white">
                      {PROFILE_INFO.name}
                    </h2>
                    {PROFILE_INFO.verified && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20">
                        <Shield className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    )}
                    {PROFILE_INFO.twoFactorEnabled && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:bg-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        2FA On
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <AtSign className="w-3 h-3 text-text5 dark:text-text5/80" />
                    <p className="text-xs text-text5 dark:text-text5/80">
                      {PROFILE_INFO.username}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-3 py-1 rounded-full border dark:text-darkLight",
                    ROLE_STYLES[PROFILE_INFO.roleLevel],
                  )}
                >
                  {PROFILE_INFO.role}
                </span>
              </div>

              <p className="text-xs text-text5 dark:text-text5 leading-relaxed max-w-xl">
                {PROFILE_INFO.bio}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 mt-5">
            {[
              { icon: Mail, label: "Email", value: PROFILE_INFO.email },
              { icon: Phone, label: "Phone", value: PROFILE_INFO.phone },
              { icon: MapPin, label: "Location", value: PROFILE_INFO.location },
              {
                icon: Building2,
                label: "Department",
                value: PROFILE_INFO.department,
              },
              { icon: Globe, label: "Website", value: "retwho.com" },
              { icon: Clock, label: "Timezone", value: "GMT +6" },
              { icon: Calendar, label: "Joined", value: PROFILE_INFO.joinedAt },
              {
                icon: Clock,
                label: "Last Login",
                value: PROFILE_INFO.lastLogin,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 p-2.5 rounded-md bg-white dark:bg-darkPrimary border border-border/30 dark:border-darkBorder/30"
              >
                <item.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-text5 font-medium uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-[11px] font-semibold text-text6 dark:text-text4 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PROFILE_STATS.map((stat) => {
          const Icon = ICON_MAP[stat.iconName] || Activity;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-border/40 dark:border-darkBorder/40 bg-white dark:bg-darkBg p-4 hover:border-primary/25 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    stat.bg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-black dark:text-white">
                {stat.value}
              </p>
              <p className="text-[11px] text-text5 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Grid: Activity + Permissions / Linked Accounts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-3 rounded-lg border border-border/40 dark:border-darkBorder/40 bg-white dark:bg-darkBg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Recent Activity
            </h3>
            <button className="text-xs text-primary font-medium hover:underline cursor-pointer">
              View all
            </button>
          </div>
          <div className="space-y-0.5">
            {RECENT_ACTIVITY.map((activity) => {
              const Icon = ICON_MAP[activity.iconName] || Activity;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-light/60 dark:hover:bg-darkPrimary/60 transition-colors group cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                      activity.bg,
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", activity.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text6 dark:text-text4 line-clamp-1">
                      {activity.action}{" "}
                      <span className="text-primary font-semibold">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-[10px] text-text5 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Permissions */}
          <div className="rounded-lg border border-border/40 dark:border-darkBorder/40 bg-white dark:bg-darkBg p-5">
            <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              Permissions
              <span className="ml-auto text-[10px] font-medium text-text5 bg-gray-light dark:bg-darkPrimary px-1.5 py-0.5 rounded-full">
                {PROFILE_PERMISSIONS.length} granted
              </span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {PROFILE_PERMISSIONS.map((perm) => (
                <span
                  key={perm}
                  className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary border border-primary/15 dark:border-primary/20"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Linked / Other Accounts ── */}
      <div className="rounded-lg border border-border/40 dark:border-darkBorder/40 bg-white dark:bg-darkBg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Linked Accounts
            </h3>
            <p className="text-xs text-text5 mt-0.5">
              Other admin accounts associated with this platform
            </p>
          </div>
          <span className="text-[11px] font-semibold text-text5 bg-gray-light dark:bg-darkPrimary px-4 py-1 rounded-full">
            {linkedAccounts.length} accounts
          </span>
        </div>

        {linkedAccounts.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-light dark:bg-darkPrimary flex items-center justify-center mx-auto mb-3">
              <User className="w-5 h-5 text-text4" />
            </div>
            <p className="text-sm text-text5">No linked accounts</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {linkedAccounts.map((account) => (
              <LinkedAccountCard
                key={account.id}
                account={account}
                onSwitch={handleSwitch}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
