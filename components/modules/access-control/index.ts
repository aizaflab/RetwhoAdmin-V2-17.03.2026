// src/modules/access-control/index.ts

// 🔐 Core access functions
export { hasAccess, filterMenuByAccess } from "./lib/has-access";

// 🧠 Types
export type {
  CurrentUserAccess,
  GrantedPermission,
  PermissionScope,
  AccessTarget,
  AdminMenuItem,
} from "./_types/access.types";

// 🎯 Permission constants
export { PERMISSIONS } from "./_config/permission";

// 🛡️ Components
export { default as PermissionGuard } from "./_components/PermissionGuard";

// 🛡️ Hooks
export { useCurrentAccess } from "./_hooks/useCurrentAccess";
