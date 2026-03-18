// src/modules/access-control/types/access.types.ts

export type PermissionScope =
  | "global"
  | "tenant"
  | "department"
  | "assigned"
  | "own";

export interface GrantedPermission {
  key: string;
  scope: PermissionScope;
}

export interface CurrentUserAccess {
  id: string;
  roleKeys: string[];
  permissions: GrantedPermission[];
  deniedPermissions?: string[];
  tenantId?: string;
  departmentId?: string;
  featureFlags?: string[];
}

export interface AccessTarget {
  tenantId?: string;
  departmentId?: string;
  ownerId?: string;
  assignedUserId?: string;
}

import React from "react";

export interface AdminMenuItem {
  id: string;
  title: string;
  type: "group" | "item" | "label";
  icon?: React.ElementType;
  path?: string;
  children?: AdminMenuItem[];
  requiredPermissions?: string[];
  requiredFeatures?: string[];
  requireAllPermissions?: boolean;
  order?: number;
  isHidden?: boolean;
}
