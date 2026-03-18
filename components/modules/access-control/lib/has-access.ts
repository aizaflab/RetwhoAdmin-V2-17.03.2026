// src/modules/access-control/lib/has-access.ts

import type {
  AccessTarget,
  AdminMenuItem,
  CurrentUserAccess,
  GrantedPermission,
} from "../_types/access.types";

function hasFeatureAccess(
  user: CurrentUserAccess,
  requiredFeatures?: string[],
): boolean {
  if (!requiredFeatures || requiredFeatures.length === 0) return true;

  const userFeatures = user.featureFlags ?? [];
  return requiredFeatures.every((feature) => userFeatures.includes(feature));
}

function matchScope(
  scope: GrantedPermission["scope"],
  user: CurrentUserAccess,
  target?: AccessTarget,
): boolean {
  switch (scope) {
    case "global":
      return true;

    case "tenant":
      if (!target?.tenantId) return true;
      return !!user.tenantId && user.tenantId === target.tenantId;

    case "department":
      if (!target?.departmentId) return true;
      return !!user.departmentId && user.departmentId === target.departmentId;

    case "own":
      return !!target?.ownerId && target.ownerId === user.id;

    case "assigned":
      return !!target?.assignedUserId && target.assignedUserId === user.id;

    default:
      return false;
  }
}

export function hasAccess(
  user: CurrentUserAccess,
  requiredPermissions?: string[],
  target?: AccessTarget,
  requireAllPermissions = false,
  requiredFeatures?: string[],
): boolean {
  if (!hasFeatureAccess(user, requiredFeatures)) return false;
  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  const deniedPermissions = user.deniedPermissions ?? [];

  if (
    requiredPermissions.some((permission) =>
      deniedPermissions.includes(permission),
    )
  ) {
    return false;
  }

  const checkSinglePermission = (permission: string): boolean => {
    const matchedPermissions = user.permissions.filter(
      (grantedPermission) => grantedPermission.key === permission,
    );

    if (matchedPermissions.length === 0) return false;

    return matchedPermissions.some((grantedPermission) =>
      matchScope(grantedPermission.scope, user, target),
    );
  };

  if (requireAllPermissions) {
    return requiredPermissions.every(checkSinglePermission);
  }

  return requiredPermissions.some(checkSinglePermission);
}

export function filterMenuByAccess(
  menu: AdminMenuItem[],
  user: CurrentUserAccess,
): AdminMenuItem[] {
  return menu
    .map((item) => {
      if (item.isHidden) return null;

      if (item.type === "group" && item.children?.length) {
        const allowedChildren = item.children
          .filter((child) =>
            hasAccess(
              user,
              child.requiredPermissions,
              undefined,
              child.requireAllPermissions,
              child.requiredFeatures,
            ),
          )
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        if (allowedChildren.length === 0) return null;

        const groupAccess = hasAccess(
          user,
          item.requiredPermissions,
          undefined,
          item.requireAllPermissions,
          item.requiredFeatures,
        );

        if (
          item.requiredPermissions &&
          item.requiredPermissions.length > 0 &&
          !groupAccess
        ) {
          return null;
        }

        return {
          ...item,
          children: allowedChildren,
        };
      }

      const isAllowed = hasAccess(
        user,
        item.requiredPermissions,
        undefined,
        item.requireAllPermissions,
        item.requiredFeatures,
      );

      return isAllowed ? item : null;
    })
    .filter((item): item is AdminMenuItem => item !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
