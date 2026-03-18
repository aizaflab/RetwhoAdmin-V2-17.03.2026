// src/modules/access-control/hooks/useCurrentAccess.ts
"use client";

import { PERMISSIONS } from "../_config/permission";
import type { CurrentUserAccess } from "../_types/access.types";

export function useCurrentAccess(): CurrentUserAccess {
  return {
    id: "u1",
    roleKeys: ["admin"],
    tenantId: "t1",
    departmentId: "d1",
    featureFlags: ["blog_module", "support_module"],
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, scope: "global" },
      { key: PERMISSIONS.PRODUCT_LIST, scope: "tenant" },
      { key: PERMISSIONS.PRODUCT_CREATE, scope: "tenant" },
      { key: PERMISSIONS.ROLE_LIST, scope: "tenant" },
      { key: PERMISSIONS.HELP_CENTER_VIEW, scope: "global" },
    ],
    deniedPermissions: [],
  };
}
