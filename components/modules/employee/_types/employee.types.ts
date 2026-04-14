// ─── Employee Module Types ────────────────────────────────────────────────────

export type EmployeeJobType = "fulltime" | "parttime" | "hourly";
export type EmployeeReferType =
  | "wholesaler"
  | "retailer"
  | "restaurant"
  | "none";
export type EmployeeSalaryType = "monthly" | "weekly" | "yearly";
export type EmployeePaymentType = "bank" | "cash" | "cheque" | "mobile_banking";
export type EmployeeStatus = "active" | "inactive" | "suspended" | "resigned";

export interface Employee {
  id: string;
  name: string;
  email: string;
  roleId: string; // ID referencing a Role
  phone: string;
  referCommission: number;
  referType: EmployeeReferType;
  note?: string;
  jobType: EmployeeJobType;

  // Base employment stats
  status: EmployeeStatus;
  joinedAt: string; // ISO date string

  // Conditional fields for "fulltime" / general
  salaryType?: EmployeeSalaryType;
  salary?: number;
  paymentType?: EmployeePaymentType;
  workingHour?: string;

  // Conditional fields for "parttime"
  partTimeDate?: string;
  partTimeTime?: string;
  dailyWorkingHour?: string; // string or number

  // Conditional fields for "hourly"
  hourlySalary?: number;

  createdAt: string;
  updatedAt: string;
}
