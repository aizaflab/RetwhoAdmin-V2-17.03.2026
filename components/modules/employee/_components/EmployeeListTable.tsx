"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, SimpleSelect } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/dropdown/Dropdown";
import {
  UserCircle,
  Edit2,
  Trash2,
  MoreVertical,
  Eye,
  Briefcase,
} from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";
import DeleteModal from "@/components/ui/modal/DeleteModal";
// Assuming Employee Type is exported from _types
import { Employee } from "../_types/employee.types";
import { mockEmployees } from "../_data/mock-employee";

interface EmployeeListTableProps {
  employees?: Employee[];
  onDelete?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  suspended: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  resigned: "bg-gray-50 text-gray-600 dark:bg-gray-950/30 dark:text-gray-400",
};

export default function EmployeeListTable({
  employees = mockEmployees,
  onDelete,
}: EmployeeListTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
    { value: "resigned", label: "Resigned" },
  ];

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ];

  const columns: Column<Employee>[] = [
    {
      id: "name",
      header: "Employee",
      cell: (value, emp) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/20 shrink-0">
            <UserCircle className="w-4 h-4 text-primary dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">
              {emp.name}
            </p>
            <p className="text-xs text-text5">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      className: "hidden md:table-cell",
      cell: (value, emp) => (
        <p className="text-sm text-text6 dark:text-text5">{emp.phone || "—"}</p>
      ),
    },
    {
      id: "roleId",
      header: "Role",
      className: "hidden sm:table-cell text-center",
      cell: (value, emp) => (
        <span className="text-sm capitalize font-medium text-text6 dark:text-text5">
          {emp.roleId || "—"}
        </span>
      ),
    },
    {
      id: "jobType",
      header: "Job Type",
      className: "hidden lg:table-cell text-center",
      cell: (value, emp) => (
        <div className="flex items-center justify-start gap-1.5 text-sm text-text6 dark:text-text5 capitalize">
          <Briefcase className="w-3.5 h-3.5" />
          {emp.jobType}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, emp) => (
        <span
          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${STATUS_STYLES[emp.status] || STATUS_STYLES.inactive}`}
        >
          {emp.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof Employee,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, emp) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Normally this would navigate to edit page
                // router.push(`/employee/${emp.id}/edit`);
                console.log("Edit", emp.id);
              }}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? emp.id : null)}
          >
            <SimpleTooltip
              content="More"
              position="top"
              disabled={openDropdownId === emp.id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="end" className="min-w-[150px] p-1 font-medium">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  // View modal or drawer could be triggered here
                  console.log("View", emp.id);
                }}
                className="text-text6 dark:text-text5 text-xs rounded-sm py-2 cursor-pointer"
              >
                View Profile
              </DropdownItem>
              <DropdownItem
                icon={<Trash2 className="size-3.5" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setEmployeeToDelete(emp);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete Employee
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || emp.roleId === roleFilter;
    const matchStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h3 className="text-xl font-medium">Manage Employees</h3>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80 dark:focus:border-darkBorder"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {/* Role Filter */}
            <div className="relative w-32">
              <SimpleSelect
                options={roleOptions}
                value={roleFilter}
                onChange={setRoleFilter}
                className="h-10 rounded-md bg-white dark:bg-darkBg"
                arrowClass="size-6"
              />
            </div>
            {/* Status filter */}
            <div className="relative w-32">
              <SimpleSelect
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                className="h-10 rounded-md bg-white dark:bg-darkBg"
                arrowClass="size-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="">
        <Table<Employee>
          data={filtered}
          columns={columns}
          pagination={true}
          limit={10}
          bordered
          emptyMessage="No employees found"
          headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
          tableClassName="min-w-full"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Are You Sure?"
        text={`Are you sure you want to delete employee "${employeeToDelete?.name}"? You cannot undo this action.`}
        deleteModal={!!employeeToDelete}
        setDeleteModal={(open) => {
          if (!open) setEmployeeToDelete(null);
        }}
        selectedRow={employeeToDelete}
        handleDelete={(emp) => {
          if (emp) {
            onDelete?.(emp.id);
            setEmployeeToDelete(null);
          }
        }}
      />
    </div>
  );
}
