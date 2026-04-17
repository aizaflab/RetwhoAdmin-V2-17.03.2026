"use client";

import { useState } from "react";
import { ChevronRight, Activity, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
import { SettingsTab, SessionItem } from "../_types/profile.types";

// Data
import {
  SETTINGS_TABS,
  ACTIVE_SESSIONS,
  DEFAULT_GENERAL,
  DEFAULT_NOTIF_PREFS,
  DEFAULT_SECURITY,
  DEFAULT_APPEARANCE,
} from "../_data/settings.data";

// Tab panels
import ProfileTab from "./tabs/ProfileTab";
import GeneralTab from "./tabs/GeneralTab";
import NotificationsTab from "./tabs/NotificationsTab";
import SecurityTab from "./tabs/SecurityTab";
import AppearanceTab from "./tabs/AppearanceTab";
import SessionsTab from "./tabs/SessionsTab";
import DataTab from "./tabs/DataTab";

// ── Save Status helpers ────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved";

function useSaveStatus(key: string) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const save = () => {
    setStatus("saving");
    setTimeout(() => {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    }, 1200);
  };
  return { status, save };
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Tab-level state — lifted here so switching tabs doesn't reset forms
  const [generalData, setGeneralData] = useState(DEFAULT_GENERAL);
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);
  const [securityPrefs, setSecurityPrefs] = useState(DEFAULT_SECURITY);
  const [appearancePrefs, setAppearancePrefs] = useState(DEFAULT_APPEARANCE);
  const [sessions, setSessions] = useState<SessionItem[]>(ACTIVE_SESSIONS);

  const generalSave = useSaveStatus("general");
  const notifSave = useSaveStatus("notifications");
  const appearanceSave = useSaveStatus("appearance");

  const activeTabMeta = SETTINGS_TABS.find((t) => t.id === activeTab)!;

  const renderPanel = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "general":
        return (
          <GeneralTab
            data={generalData}
            onChange={setGeneralData}
            saveStatus={generalSave.status}
            onSave={generalSave.save}
          />
        );
      case "notifications":
        return (
          <NotificationsTab
            prefs={notifPrefs}
            onChange={setNotifPrefs}
            saveStatus={notifSave.status}
            onSave={notifSave.save}
          />
        );
      case "security":
        return (
          <SecurityTab prefs={securityPrefs} onChange={setSecurityPrefs} />
        );
      case "appearance":
        return (
          <AppearanceTab
            prefs={appearancePrefs}
            onChange={setAppearancePrefs}
            saveStatus={appearanceSave.status}
            onSave={appearanceSave.save}
          />
        );
      case "sessions":
        return <SessionsTab sessions={sessions} onChange={setSessions} />;
      case "data":
        return <DataTab />;
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)]">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Sidebar ── */}
        <div className="lg:w-64 shrink-0">
          <div className="rounded-sm border border-text4/30 dark:border-darkBorder/50 bg-white dark:bg-darkBg overflow-hidden lg:sticky top-[90px] min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-110px)]">
            {/* Mini profile atop sidebar */}
            <div className="px-4 pt-4 pb-3 border-b border-primary/10 dark:border-darkBorder/40 bg-primary/10 dark:bg-darkPrimary/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-darkBorder/50 border border-gray-light dark:border-darkBorder/40 center shrink-0">
                <span className="text-sm font-semibold text-primary dark:text-darkLight">
                  AD
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text6 dark:text-white truncate">
                  Admin User
                </p>
                <p className="text-[10px] text-text5 truncate">Super Admin</p>
              </div>
            </div>

            <nav className="p-2 space-y-0.5">
              {SETTINGS_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer group",
                      isActive
                        ? "bg-primary/5 dark:bg-darkPrimary text-primary dark:text-darkLight"
                        : "text-text6 dark:text-text5 hover:bg-gray-light/50 dark:hover:bg-darkPrimary",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg center shrink-0 transition-colors",
                        isActive
                          ? "bg-primary/10 dark:bg-darkBorder/50"
                          : "bg-gray-light dark:bg-darkPrimary/70 group-hover:bg-primary/10 dark:group-hover:bg-darkBorder/50",
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "w-4 h-4",
                          isActive
                            ? "text-primary dark:text-darkLight"
                            : "text-text5 group-hover:text-primary dark:group-hover:text-darkLight",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          isActive ? "text-primary dark:text-darkLight" : "",
                        )}
                      >
                        {tab.label}
                      </p>
                      <p className="text-[10px] text-text5 truncate hidden sm:block">
                        {tab.desc}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Content Panel ── */}
        <div className="flex-1 min-w-0">
          <div className="rounded-lg border border-text4/30 dark:border-darkBorder/50 bg-white dark:bg-darkBg p-3 sm:p-5">
            {/* Panel header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                  <activeTabMeta.icon className="w-5 h-5 text-primary" />
                  {activeTabMeta.label}
                </h2>
                <p className="text-xs text-text5 mt-0.5">
                  {activeTabMeta.desc}
                </p>
              </div>

              {/* Right Side: Platform Status & Quick Link */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end bg-gray-light/30 dark:bg-darkPrimary/20 px-3 py-1.5 rounded-md border border-border/30 dark:border-darkBorder/30">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-text6 dark:text-text4 uppercase tracking-tighter">
                      Retwho Systems
                    </span>
                    <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Activity className="w-2.5 h-2.5 text-text5" />
                    <p className="text-[9px] text-text5">
                      Last synced: Just now
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-px bg-border/40 dark:bg-darkBorder/40 mb-5" />

            {/* Active panel */}
            {renderPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
