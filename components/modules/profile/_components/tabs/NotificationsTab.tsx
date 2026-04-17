"use client";

import { Section } from "../shared/Section";
import { ToggleRow } from "../shared/ToggleRow";
import { SaveButton } from "../shared/SaveButton";
import { NotifPrefs } from "../../_types/profile.types";
import { Button } from "@/components/ui/button/Button";

interface NotificationsTabProps {
  prefs: NotifPrefs;
  onChange: (prefs: NotifPrefs) => void;
  saveStatus: "idle" | "saving" | "saved";
  onSave: () => void;
}

export default function NotificationsTab({
  prefs,
  onChange,
  saveStatus,
  onSave,
}: NotificationsTabProps) {
  const set = (key: keyof NotifPrefs) => (v: boolean) =>
    onChange({ ...prefs, [key]: v });

  return (
    <div className="space-y-8">
      <Section
        title="Email Notifications"
        desc="Choose which emails you'd like to receive."
      >
        <div className="divide-y divide-border/30 dark:divide-darkBorder/30">
          <ToggleRow
            label="Order Updates"
            desc="New orders, status changes, disputes"
            enabled={prefs.email_orders}
            onChange={set("email_orders")}
          />
          <ToggleRow
            label="Security Alerts"
            desc="Login attempts, password changes"
            enabled={prefs.email_security}
            onChange={set("email_security")}
            badge="Recommended"
          />
          <ToggleRow
            label="Platform Updates"
            desc="New features, system updates"
            enabled={prefs.email_updates}
            onChange={set("email_updates")}
          />
          <ToggleRow
            label="Promotions & Offers"
            desc="Campaigns, discounts, events"
            enabled={prefs.email_promotions}
            onChange={set("email_promotions")}
          />
        </div>
      </Section>

      <Section
        title="Push Notifications"
        desc="Real-time browser notifications."
      >
        <div className="divide-y divide-border/30 dark:divide-darkBorder/30">
          <ToggleRow
            label="Orders"
            desc="New and updated orders"
            enabled={prefs.push_orders}
            onChange={set("push_orders")}
          />
          <ToggleRow
            label="Security"
            desc="Critical security alerts"
            enabled={prefs.push_security}
            onChange={set("push_security")}
            badge="Recommended"
          />
          <ToggleRow
            label="Messages"
            desc="New messages & support tickets"
            enabled={prefs.push_messages}
            onChange={set("push_messages")}
          />
          <ToggleRow
            label="Platform Updates"
            desc="System & feature updates"
            enabled={prefs.push_updates}
            onChange={set("push_updates")}
          />
        </div>
      </Section>

      <Section
        title="SMS Notifications"
        desc="Mobile SMS alerts for critical events."
      >
        <div className="divide-y divide-border/30 dark:divide-darkBorder/30">
          <ToggleRow
            label="Security Alerts"
            desc="Login from new device, password change"
            enabled={prefs.sms_security}
            onChange={set("sms_security")}
            badge="Recommended"
          />
          <ToggleRow
            label="High-Value Orders"
            desc="Orders above ৳50,000"
            enabled={prefs.sms_orders}
            onChange={set("sms_orders")}
          />
        </div>
      </Section>

      <Section title="Digest Emails" desc="Summary reports sent to your inbox.">
        <div className="divide-y divide-border/30 dark:divide-darkBorder/30">
          <ToggleRow
            label="Daily Digest"
            desc="Daily activity & performance summary"
            enabled={prefs.digest_daily}
            onChange={set("digest_daily")}
          />
          <ToggleRow
            label="Weekly Report"
            desc="Weekly analytics and platform stats"
            enabled={prefs.digest_weekly}
            onChange={set("digest_weekly")}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saveStatus === "saving"}>
          {saveStatus === "saving" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
