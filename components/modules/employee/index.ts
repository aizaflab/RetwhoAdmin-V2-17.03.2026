export { default as EmployeeStats } from "./_components/EmployeeStats";
export { default as EmployeeListTable } from "./_components/EmployeeListTable";
export { default as EmployeeFormDialog } from "./_components/EmployeeFormDialog";
export { default as EmployeeViewDialog } from "./_components/EmployeeViewDialog";
export {
  STATUS_OPTIONS,
  STATUS_FILTER_OPTIONS,
  EMPLOYEE_STATUS_STYLES,
  employeeStatusStyle,
} from "./_data/employee-options";
// Types are listed rather than re-exported wholesale: the stats type and the
// stats component would otherwise both claim the name `EmployeeStats`.
export type {
  Employee,
  EmployeeStatus,
  EmployeeProfileImage,
  EmployeeRoleSummary,
  EmployeePayload,
  EmployeeUpdatePayload,
  EmployeeListMeta,
  EmployeeListQuery,
  EmployeeListResult,
  EmployeeStats as EmployeeStatsData,
} from "./_types/employee.types";
