"use client";

import { Download, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { Section } from "../shared/Section";

export default function DataTab() {
  return (
    <div className="space-y-8">
      <Section
        title="Export Your Data"
        desc="Download a copy of your account data and activity logs."
      >
        <div className="space-y-3">
          {[
            {
              label: "Account Information",
              desc: "Personal details, settings, and preferences",
              size: "~12 KB",
            },
            {
              label: "Notification History",
              desc: "All your received notifications (last 90 days)",
              size: "~48 KB",
            },
            {
              label: "Activity Logs",
              desc: "All admin actions and audit trail",
              size: "~2.1 MB",
            },
            {
              label: "Full Data Export",
              desc: "Complete export of all your data",
              size: "~5 MB",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 p-4 rounded-lg border border-border/40 dark:border-darkBorder/40 hover:border-border/70 dark:hover:border-darkBorder/70 transition-colors"
            >
              <Download className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text6 dark:text-text4">
                  {item.label}
                </p>
                <p className="text-xs text-text5 mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text5 font-mono hidden sm:block">
                  {item.size}
                </span>
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border/60 dark:border-darkBorder/50 text-text6 dark:text-text4 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer bg-white dark:bg-darkBg">
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Danger Zone"
        desc="Irreversible actions. Proceed with extreme caution."
      >
        <div className="space-y-4 p-4 rounded-lg border border-rose-200/70 dark:border-rose-500/20 bg-rose-50/30 dark:bg-rose-500/5">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-rose-200/50 dark:border-rose-500/20 bg-white dark:bg-darkBg">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                Reset All Preferences
              </p>
              <p className="text-xs text-text5 mt-0.5">
                Reset all settings to their default values. This action cannot
                be undone.
              </p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border border-rose-200/50 dark:border-rose-500/20 bg-white dark:bg-darkBg">
            <Trash2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                Delete Account
              </p>
              <p className="text-xs text-text5 mt-0.5">
                Permanently delete your admin account. All data will be removed.
                For superadmin accounts, contact a higher authority.
              </p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
