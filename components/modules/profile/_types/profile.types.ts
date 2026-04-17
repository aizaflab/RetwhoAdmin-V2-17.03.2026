import { LucideIcon } from "lucide-react";

export type SettingsTab =
  | "profile"
  | "general"
  | "notifications"
  | "security"
  | "appearance"
  | "sessions"
  | "data";

export interface TabMeta {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
  desc: string;
}

export interface ProfileInfo {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  roleLevel: "super_admin" | "admin" | "manager" | "viewer";
  department: string;
  location: string;
  timezone: string;
  bio: string;
  joinedAt: string;
  lastLogin: string;
  website: string;
  verified: boolean;
  twoFactorEnabled: boolean;
}

export interface LinkedAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLevel: "super_admin" | "admin" | "manager" | "viewer";
  avatar: string | null;
  initials: string;
  isActive: boolean;
  lastSeen: string;
  department: string;
  color: string; // tailwind bg color for avatar
}

export interface ProfileStat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  iconName: string;
  color: string;
  bg: string;
}

export interface ActivityItem {
  id: number;
  action: string;
  target: string;
  time: string;
  iconName: string;
  color: string;
  bg: string;
}

export interface SessionItem {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  current: boolean;
  lastActive: string;
  deviceType: "desktop" | "mobile" | "tablet";
}

export interface LoginHistoryItem {
  ip: string;
  location: string;
  device: string;
  time: string;
  status: "success" | "failed";
}

export interface GeneralFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  location: string;
  department: string;
  language: string;
  timezone: string;
}

export interface NotifPrefs {
  email_orders: boolean;
  email_security: boolean;
  email_updates: boolean;
  email_promotions: boolean;
  push_orders: boolean;
  push_security: boolean;
  push_messages: boolean;
  push_updates: boolean;
  sms_security: boolean;
  sms_orders: boolean;
  digest_daily: boolean;
  digest_weekly: boolean;
}

export interface SecurityPrefs {
  twoFactor: boolean;
  loginAlerts: boolean;
  trustedDevices: boolean;
  sessionTimeout: boolean;
  activityLog: boolean;
}

export interface AppearancePrefs {
  theme: string;
  density: string;
  language: string;
  sidebarCollapsed: boolean;
  animations: boolean;
}
