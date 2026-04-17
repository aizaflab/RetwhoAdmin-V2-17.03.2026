"use client";

import { useState } from "react";
import { Monitor, Smartphone, Clock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "../shared/Section";
import { SessionItem } from "../../_types/profile.types";

const DEVICE_ICON: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Smartphone,
};

interface SessionsTabProps {
  sessions: SessionItem[];
  onChange: (sessions: SessionItem[]) => void;
}

export default function SessionsTab({ sessions, onChange }: SessionsTabProps) {
  const revoke = (id: string) => onChange(sessions.filter((s) => s.id !== id));
  const revokeAll = () => onChange(sessions.filter((s) => s.current));

  return (
    <div className="space-y-8">
      <Section
        title="Active Sessions"
        desc="Devices currently signed into your account."
      >
        <div className="space-y-3">
          {sessions.map((session) => {
            const Icon = DEVICE_ICON[session.deviceType] || Monitor;
            return (
              <div
                key={session.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-all",
                  session.current
                    ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                    : "border-border/40 dark:border-darkBorder/40 hover:border-border/70 dark:hover:border-darkBorder/70",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    session.current
                      ? "bg-primary/15"
                      : "bg-gray-light dark:bg-darkPrimary",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      session.current ? "text-primary" : "text-text5",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text6 dark:text-text4">
                      {session.device}
                    </p>
                    {session.current && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text5 mt-0.5">
                    {session.browser} · {session.location}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-mono text-text5">
                      {session.ip}
                    </span>
                    <span className="text-[10px] text-text5 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {session.lastActive}
                    </span>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => revoke(session.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <div className="flex justify-between items-center p-4 rounded-lg border border-rose-200/50 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5">
        <div>
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
            Sign Out All Devices
          </p>
          <p className="text-xs text-rose-600/70 dark:text-rose-500/70 mt-0.5">
            Revoke access from all devices except this one.
          </p>
        </div>
        <button
          onClick={revokeAll}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Sign Out All
        </button>
      </div>
    </div>
  );
}
