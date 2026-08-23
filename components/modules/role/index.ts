export { default as RoleStats } from "./_components/RoleStats";
export { default as RoleListTable } from "./_components/RoleListTable";
export { default as RoleFormEditor } from "./_components/RoleFormEditor";
export { default as RoleViewDrawer } from "./_components/RoleViewDrawer";
export { default as PermissionMatrix } from "./_components/PermissionMatrix";
export {
  ROLE_PAGES,
  PERMISSION_ACTIONS,
  emptyPermissions,
  normalizePermissions,
  countGrants,
  getPageLabel,
  type PermissionAction,
} from "./_data/role-pages";
export type {
  Role,
  RoleStatus,
  RolePermission,
  RolePayload,
  RoleListMeta,
  RoleListQuery,
  RoleListResponse,
  RoleListResult,
  RoleStats as RoleStatsData,
} from "./_types/role.types";
