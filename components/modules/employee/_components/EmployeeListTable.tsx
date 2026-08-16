"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import { UserCircle, Edit2, Trash2, Eye, Plus } from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";
import DeleteModal from "@/components/ui/modal/DeleteModal";

import EmployeeFormDialog from "./EmployeeFormDialog";
import EmployeeViewDialog from "./EmployeeViewDialog";
import { ROLE_OPTIONS, getRoleName } from "../_data/employee-options";
import { mockEmployees } from "../_data/mock-employee";
import type { Employee, EmployeePayload } from "../_types/employee.types";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";

interface EmployeeListTableProps {
  employees?: Employee[];
  onCreate?: (payload: EmployeePayload) => void | Promise<void>;
  onUpdate?: (id: string, payload: EmployeePayload) => void | Promise<void>;
  onDelete?: (id: string) => void;
}

/* Tinted from the semantic tokens so both themes resolve from the same source. */
const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

const ACTION_BUTTON =
  "cursor-pointer center size-8 rounded-lg border border-border bg-card text-muted-foreground transition-all duration-150";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function EmployeeListTable({
  employees = mockEmployees,
  onCreate,
  onUpdate,
  onDelete,
}: EmployeeListTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  // Set alongside `formOpen` for edit; left null when adding.
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const roleOptions = [
    { value: "all", label: "All Roles" },
    ...ROLE_OPTIONS.map((role) => ({
      value: String(role.value),
      label: role.label,
    })),
  ];

  const openAdd = () => {
    setEmployeeToEdit(null);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: EmployeePayload) => {
    if (employeeToEdit) await onUpdate?.(employeeToEdit._id, payload);
    else await onCreate?.(payload);
  };

  const columns: Column<Employee>[] = [
    {
      id: "name",
      header: "Employee",
      cell: (value, emp) => (
        <div className="flex items-center gap-3">
          {emp.profileImage?.url ? (
            <Image
              src={emp.profileImage.url}
              alt={emp.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
              <UserCircle className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">{emp.name}</p>
            <p className="text-xs text-muted-foreground">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      className: "hidden md:table-cell",
      cell: (value, emp) => (
        <p className="text-sm text-muted-foreground">{emp.phone || "—"}</p>
      ),
    },
    {
      id: "roleId",
      header: "Role",
      className: "hidden sm:table-cell",
      cell: (value, emp) => (
        <span className="text-sm font-medium text-muted-foreground">
          {getRoleName(emp.roleId)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, emp) => (
        <span
          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
            STATUS_STYLES[emp.status] || STATUS_STYLES.inactive
          }`}
        >
          {emp.status}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden lg:table-cell",
      cell: (value, emp) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(emp.createdAt)}
        </span>
      ),
    },
    {
      id: "actions" as keyof Employee,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, emp) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="View" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEmployeeToView(emp);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(emp);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Delete" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEmployeeToDelete(emp);
              }}
              className={`${ACTION_BUTTON} hover:border-destructive/50 hover:text-destructive`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  // this is dummy filtering logic, remove it when the API is wired up with search and filter params
  const filtered = employees.filter((emp) => {
    const query = search.toLowerCase();
    const matchSearch =
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (emp.phone ?? "").toLowerCase().includes(query);
    const matchRole = roleFilter === "all" || emp.roleId === roleFilter;
    const matchStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Clamp instead of resetting `page` in an effect, so filtering down to fewer
  // pages can never leave the table showing an empty slice.
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  // Client-side slicing — drop this once the API takes page/limit params.
  const paginated = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h3 className="text-xl font-medium text-foreground">
          Manage Employees
        </h3>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card border-border"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {/* Role Filter */}
            <div className="relative w-32">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue options={roleOptions} placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={roleOptions} />
                </SelectContent>
              </Select>
            </div>
            {/* Status filter */}
            <div className="relative w-32">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue
                    options={statusOptions}
                    placeholder="All Status"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={statusOptions} />
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={openAdd}
              className="h-10 shrink-0"
              startIcon={<Plus className="w-4 h-4" />}
            >
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<Employee>
        data={paginated}
        columns={columns}
        pagination
        page={currentPage}
        setPage={setPage}
        limit={limit}
        setLimit={(next) => {
          setLimit(next);
          setPage(1);
        }}
        totalData={filtered.length}
        bordered
        emptyMessage="No employees found"
        headerColor="bg-muted/60"
        tableClassName="min-w-full"
      />

      {/* Add / Edit */}
      <EmployeeFormDialog
        open={formOpen}
        employee={employeeToEdit}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* View */}
      <EmployeeViewDialog
        open={!!employeeToView}
        employee={employeeToView}
        onClose={() => setEmployeeToView(null)}
        onEdit={(emp) => {
          setEmployeeToView(null);
          openEdit(emp);
        }}
      />

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
            onDelete?.(emp._id);
            setEmployeeToDelete(null);
          }
        }}
      />
    </div>
  );
}
