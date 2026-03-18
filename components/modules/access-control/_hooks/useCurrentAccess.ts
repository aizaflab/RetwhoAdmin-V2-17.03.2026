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
    permissions: Object.values(PERMISSIONS).map((key) => ({
      key,
      scope: "global",
    })),
    deniedPermissions: [],
  };
}
