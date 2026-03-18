// src/components/PermissionGuard.tsx

"use client";

import { ReactNode } from "react";
import { AccessTarget, CurrentUserAccess } from "../_types/access.types";
import { hasAccess } from "../lib/has-access";

interface PermissionGuardProps {
  user: CurrentUserAccess;
  permissions?: string[];
  target?: AccessTarget;
  requireAll?: boolean;
  features?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export default function PermissionGuard({
  user,
  permissions,
  target,
  requireAll = false,
  features,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const allowed = hasAccess(user, permissions, target, requireAll, features);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
