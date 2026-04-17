"use client";

import { useState } from "react";
import {
  Key,
  Smartphone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FingerprintIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "../shared/Section";
import { PasswordField } from "../shared/PasswordField";
import { ToggleRow } from "../shared/ToggleRow";
import { SecurityPrefs } from "../../_types/profile.types";
import { LOGIN_HISTORY } from "../../_data/settings.data";
import { Button } from "@/components/ui/button/Button";

interface SecurityTabProps {
  prefs: SecurityPrefs;
  onChange: (prefs: SecurityPrefs) => void;
}

export default function SecurityTab({ prefs, onChange }: SecurityTabProps) {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [pwStrength, setPwStrength] = useState(0);

  const handlePasswordChange = (
    field: keyof typeof passwords,
    value: string,
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (field === "new") {
      let s = 0;
      if (value.length >= 8) s++;
      if (/[A-Z]/.test(value)) s++;
      if (/[0-9]/.test(value)) s++;
      if (/[^A-Za-z0-9]/.test(value)) s++;
      setPwStrength(s);
    }
  };

  const set = (key: keyof SecurityPrefs) => (v: boolean) =>
    onChange({ ...prefs, [key]: v });

  const pwStrengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const pwStrengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-amber-400",
    "bg-emerald-500",
  ][pwStrength];

  return (
    <div className="space-y-8">
      <Section
        title="Change Password"
        desc="Use a strong password of at least 8 characters with mixed case, numbers, and symbols."
      >
        <div className="space-y-4">
          <PasswordField
            label="Current Password"
            value={passwords.current}
            onChange={(v) => handlePasswordChange("current", v)}
          />

          <PasswordField
            label="New Password"
            value={passwords.new}
            onChange={(v) => handlePasswordChange("new", v)}
          />
          {passwords.new && (
            <div className="space-y-1">
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-full transition-colors",
                      i <= pwStrength
                        ? pwStrengthColor
                        : "bg-slate-200 dark:bg-slate-700",
                    )}
                  />
                ))}
              </div>
              <p
                className={cn(
                  "text-[11px] font-medium",
                  pwStrength >= 3
                    ? "text-emerald-500"
                    : pwStrength >= 2
                      ? "text-amber-500"
                      : "text-red-500",
                )}
              >
                Password strength: {pwStrengthLabel}
              </p>
            </div>
          )}
          <PasswordField
            label="Confirm New Password"
            value={passwords.confirm}
            onChange={(v) => handlePasswordChange("confirm", v)}
          />
          {passwords.confirm && passwords.new !== passwords.confirm && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Passwords do not match
            </p>
          )}

          <div className="flex items-center justify-end">
            <Button>
              <Key className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Two-Factor Authentication"
        desc="Add an extra layer of security to your account."
      >
        <div className="divide-y divide-border/30 dark:divide-darkBorder/30">
          <ToggleRow
            label="Enable 2FA"
            desc="Require a verification code on every login"
            enabled={prefs.twoFactor}
            onChange={set("twoFactor")}
            badge="Active"
          />
        </div>
        {prefs.twoFactor && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: Smartphone,
                label: "Authenticator App",
                desc: "Google / Authy",
                active: true,
              },
              {
                icon: Mail,
                label: "Email OTP",
                desc: "admin@retwho.com",
                active: false,
              },
              {
                icon: FingerprintIcon,
                label: "Biometric",
                desc: "Fingerprint / Face ID",
                active: false,
              },
            ].map((method) => (
              <div
                key={method.label}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all",
                  method.active
                    ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                    : "border-border/40 dark:border-darkBorder/40 hover:border-primary/30 hover:bg-gray-light dark:hover:bg-darkPrimary",
                )}
              >
                <method.icon
                  className={cn(
                    "w-5 h-5 mb-2",
                    method.active ? "text-primary" : "text-text5",
                  )}
                />
                <p className="text-xs font-semibold text-text6 dark:text-text4">
                  {method.label}
                </p>
                <p className="text-[10px] text-text5 mt-0.5">{method.desc}</p>
                {method.active && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-primary">
                    <CheckCircle2 className="w-3 h-3" /> Enabled
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Security Preferences"
        desc="Control how your account handles security events."
      >
        <div className="divide-y divide-border/30 dark:divide-darkBorder/30">
          <ToggleRow
            label="Login Alerts"
            desc="Email alert on new device login"
            enabled={prefs.loginAlerts}
            onChange={set("loginAlerts")}
            badge="Recommended"
          />
          <ToggleRow
            label="Trusted Devices"
            desc="Remember device for 30 days"
            enabled={prefs.trustedDevices}
            onChange={set("trustedDevices")}
          />
          <ToggleRow
            label="Auto Session Timeout"
            desc="Log out after 30 min of inactivity"
            enabled={prefs.sessionTimeout}
            onChange={set("sessionTimeout")}
          />
          <ToggleRow
            label="Activity Logging"
            desc="Keep detailed log of admin actions"
            enabled={prefs.activityLog}
            onChange={set("activityLog")}
          />
        </div>
      </Section>

      <Section
        title="Login History"
        desc="Recent login activity for your account."
      >
        <div className="overflow-x-auto rounded-md border border-border/40 dark:border-darkBorder/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-light dark:bg-darkPrimary">
                <th className="px-4 py-2.5 text-left font-medium text-text5 uppercase tracking-wide">
                  IP Address
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-text5 uppercase tracking-wide">
                  Location
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-text5 uppercase tracking-wide hidden sm:table-cell">
                  Device
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-text5 uppercase tracking-wide">
                  Time
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-text5 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 dark:divide-darkBorder/30">
              {LOGIN_HISTORY.map((log, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-light/40 dark:hover:bg-darkPrimary/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-text6 dark:text-text4">
                    {log.ip}
                  </td>
                  <td className="px-4 py-3 text-text6 dark:text-text5">
                    {log.location}
                  </td>
                  <td className="px-4 py-3 text-text5 hidden sm:table-cell">
                    {log.device}
                  </td>
                  <td className="px-4 py-3 text-text5 whitespace-nowrap">
                    {log.time}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.status === "success" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 dark:text-red-400 font-medium">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
