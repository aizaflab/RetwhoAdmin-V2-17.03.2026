import {
  User,
  Edit3,
  Bell,
  Shield,
  Palette,
  Monitor,
  Download,
  CheckCircle2,
  Package,
  Activity,
  Globe,
  Star,
} from "lucide-react";
import {
  TabMeta,
  ProfileInfo,
  LinkedAccount,
  ProfileStat,
  ActivityItem,
  SessionItem,
  LoginHistoryItem,
  GeneralFormData,
  NotifPrefs,
  SecurityPrefs,
  AppearancePrefs,
} from "../_types/profile.types";

// ── Tabs ───────────────────────────────────────────────────────────────────

export const SETTINGS_TABS: TabMeta[] = [
  {
    id: "profile",
    label: "My Profile",
    icon: User,
    desc: "Info & linked accounts",
  },
  {
    id: "general",
    label: "General",
    icon: Edit3,
    desc: "Personal info & preferences",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    desc: "Alerts & preferences",
  },
  { id: "security", label: "Security", icon: Shield, desc: "Password & 2FA" },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    desc: "Theme & display",
  },
  { id: "sessions", label: "Sessions", icon: Monitor, desc: "Active devices" },
  {
    id: "data",
    label: "Data & Privacy",
    icon: Download,
    desc: "Export & delete",
  },
];

// ── Profile ────────────────────────────────────────────────────────────────

export const PROFILE_INFO: ProfileInfo = {
  name: "Admin User",
  username: "admin_retwho",
  email: "admin@retwho.com",
  phone: "+880 1700-000000",
  role: "Super Admin",
  roleLevel: "super_admin",
  department: "Platform Operations",
  location: "Dhaka, Bangladesh",
  timezone: "Asia/Dhaka (GMT+6)",
  bio: "Platform super-administrator responsible for overseeing all system operations.",
  joinedAt: "March 15, 2024",
  lastLogin: "Today at 12:02 PM",
  website: "https://retwho.com",
  verified: true,
  twoFactorEnabled: true,
};

// ── Linked / Associated Accounts ───────────────────────────────────────────

export const LINKED_ACCOUNTS: LinkedAccount[] = [
  {
    id: "la-001",
    name: "Rafiq Ahmed",
    email: "rafiq@retwho.com",
    role: "Admin",
    roleLevel: "admin",
    avatar: null,
    initials: "RA",
    isActive: true,
    lastSeen: "Active now",
    department: "Store Operations",
    color: "bg-violet-600",
  },
  {
    id: "la-002",
    name: "Nazia Islam",
    email: "nazia@retwho.com",
    role: "Manager",
    roleLevel: "manager",
    avatar: null,
    initials: "NI",
    isActive: true,
    lastSeen: "2 hours ago",
    department: "Content & Marketing",
    color: "bg-rose-500",
  },
  {
    id: "la-003",
    name: "Kamal Hossain",
    email: "kamal@retwho.com",
    role: "Admin",
    roleLevel: "admin",
    avatar: null,
    initials: "KH",
    isActive: false,
    lastSeen: "Yesterday",
    department: "Finance & Reports",
    color: "bg-amber-500",
  },
  {
    id: "la-004",
    name: "Sumaiya Begum",
    email: "sumaiya@retwho.com",
    role: "Viewer",
    roleLevel: "viewer",
    avatar: null,
    initials: "SB",
    isActive: false,
    lastSeen: "3 days ago",
    department: "Support Hub",
    color: "bg-teal-500",
  },
];

// ── Profile Stats ──────────────────────────────────────────────────────────

export const PROFILE_STATS: ProfileStat[] = [
  {
    label: "Actions Today",
    value: "24",
    change: "+8 from yesterday",
    positive: true,
    iconName: "Activity",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Tickets Resolved",
    value: "148",
    change: "+12 this week",
    positive: true,
    iconName: "CheckCircle2",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Orders Approved",
    value: "2.4k",
    change: "+340 this month",
    positive: true,
    iconName: "Package",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Active Users",
    value: "8.2k",
    change: "+220 this week",
    positive: true,
    iconName: "User",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

// ── Profile Permissions ────────────────────────────────────────────────────

export const PROFILE_PERMISSIONS = [
  "Dashboard Analytics",
  "User Management",
  "Store Management",
  "Product Control",
  "Order Management",
  "Role & Permissions",
  "Financial Reports",
  "System Settings",
  "Content Management",
  "Support Hub",
];

// ── Recent Activity ────────────────────────────────────────────────────────

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    action: "Approved wholesale store registration",
    target: "Dhaka Fresh Mart",
    time: "2 hours ago",
    iconName: "CheckCircle2",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: 2,
    action: "Updated permissions for role",
    target: "Store Manager",
    time: "5 hours ago",
    iconName: "Shield",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

// ── Sessions ───────────────────────────────────────────────────────────────

export const ACTIVE_SESSIONS: SessionItem[] = [
  {
    id: "s1",
    device: "Windows PC",
    browser: "Chrome 124",
    ip: "103.123.45.67",
    location: "Dhaka, Bangladesh",
    current: true,
    lastActive: "Active now",
    deviceType: "desktop",
  },
  {
    id: "s2",
    device: "iPhone 15 Pro",
    browser: "Safari 17",
    ip: "103.123.45.68",
    location: "Dhaka, Bangladesh",
    current: false,
    lastActive: "3 hours ago",
    deviceType: "mobile",
  },
  {
    id: "s3",
    device: "MacBook Pro",
    browser: "Firefox 125",
    ip: "185.220.101.4",
    location: "London, UK",
    current: false,
    lastActive: "2 days ago",
    deviceType: "desktop",
  },
];

// ── Login History ──────────────────────────────────────────────────────────

export const LOGIN_HISTORY: LoginHistoryItem[] = [
  {
    ip: "103.123.45.67",
    location: "Dhaka, BD",
    device: "Chrome / Windows",
    time: "Today, 12:02 PM",
    status: "success",
  },
  {
    ip: "103.123.45.67",
    location: "Dhaka, BD",
    device: "Chrome / Windows",
    time: "Yesterday, 9:10 AM",
    status: "success",
  },
  {
    ip: "185.220.101.4",
    location: "London, UK",
    device: "Firefox / Mac",
    time: "Apr 15, 3:42 PM",
    status: "failed",
  },
  {
    ip: "103.123.45.67",
    location: "Dhaka, BD",
    device: "Safari / iPhone",
    time: "Apr 14, 11:00 PM",
    status: "success",
  },
];

// ── Default Form Data ──────────────────────────────────────────────────────

export const DEFAULT_GENERAL: GeneralFormData = {
  name: "Admin User",
  username: "admin_retwho",
  email: "admin@retwho.com",
  phone: "+880 1700-000000",
  bio: "Platform super-administrator responsible for overseeing all system operations.",
  website: "https://retwho.com",
  location: "Dhaka, Bangladesh",
  department: "Platform Operations",
  language: "en",
  timezone: "Asia/Dhaka",
};

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  email_orders: true,
  email_security: true,
  email_updates: false,
  email_promotions: false,
  push_orders: true,
  push_security: true,
  push_messages: true,
  push_updates: true,
  sms_security: true,
  sms_orders: false,
  digest_daily: false,
  digest_weekly: true,
};

export const DEFAULT_SECURITY: SecurityPrefs = {
  twoFactor: true,
  loginAlerts: true,
  trustedDevices: true,
  sessionTimeout: false,
  activityLog: true,
};

export const DEFAULT_APPEARANCE: AppearancePrefs = {
  theme: "system",
  density: "comfortable",
  language: "en",
  sidebarCollapsed: false,
  animations: true,
};
