// Role & Permission module types

import { PermissionKey } from "@/components/modules/access-control/_config/permission";

export type RoleStatus = "active" | "inactive" | "draft";

export interface RolePermissionEntry {
  key: PermissionKey;
  scope: "global" | "tenant" | "department" | "assigned" | "own";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  permissions: RolePermissionEntry[];
  userCount: number;
  assignedUserIds: string[]; // IDs of admin users assigned to this role
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean; // system roles cannot be deleted
}

// Lightweight user record used in role assignment UI
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
}
