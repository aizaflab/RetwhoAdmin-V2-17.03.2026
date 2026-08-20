"use client";

import { useState } from "react";
import {
  UserCircle,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Input, SimpleSelect } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "@/components/ui/dropdown/Dropdown";
import { SearchIcon, MoreIcon } from "@/components/icons/Icons";

import ApplicationViewDrawer from "./ApplicationViewDrawer";
import {
  APPLICATION_STATUS_FILTER_OPTIONS,
  applicationStatusStyle,
} from "../_data/hiring-options";
import type { ApplicationStatus, JobApplication } from "../_types/hiring.types";

interface ApplicationListTableProps {
  applications: JobApplication[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filters / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  postFilter: string;
  onPostFilterChange: (value: string) => void;
  /** Postings to filter by, as { label, value }. */
  postOptions: { label: string; value: string }[];
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onUpdateStatus?: (
    application: JobApplication,
    status: ApplicationStatus,
  ) => Promise<void> | void;
  onDelete?: (application: JobApplication) => Promise<void> | void;
  deleting?: boolean;
}

const ACTION_BUTTON =
  "cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground transition-all duration-150";

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function ApplicationListTable({
  applications,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  postFilter,
  onPostFilterChange,
  postOptions,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onUpdateStatus,
  onDelete,
  deleting,
}: ApplicationListTableProps) {
  const [viewing, setViewing] = useState<JobApplication | null>(null);
  const [toDelete, setToDelete] = useState<JobApplication | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const postFilterOptions = [
    { value: "all", label: "All Postings" },
    ...postOptions,
  ];

  const columns: Column<JobApplication>[] = [
    {
      id: "fullName",
      header: "Applicant",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
            <UserCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {row.fullName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "hiring",
      header: "Applied For",
      className: "hidden md:table-cell",
      cell: (value, row) => (
        <div className="max-w-50 min-w-0">
          <p className="text-sm text-foreground truncate">
            {row.hiring?.title || "—"}
          </p>
          {row.hiring?.companyName && (
            <p className="text-[11px] text-muted-foreground truncate">
              {row.hiring.companyName}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      className: "hidden lg:table-cell",
      cell: (value, row) => (
        <span className="text-sm text-muted-foreground">
          {row.phone || "—"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Applied On",
      className: "hidden sm:table-cell",
      cell: (value, row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${applicationStatusStyle(
            row.status,
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof JobApplication,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="View" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewing(row);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          {/* Opens the uploaded CV in a new tab; absent on older records. */}
          <SimpleTooltip
            content={row.resume?.url ? "Open résumé" : "No résumé attached"}
            position="top"
          >
            <a
              href={row.resume?.url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!row.resume?.url}
              onClick={(e) => {
                e.stopPropagation();
                if (!row.resume?.url) e.preventDefault();
              }}
              className={`${ACTION_BUTTON} ${
                row.resume?.url
                  ? "hover:border-primary/50 hover:text-primary"
                  : "cursor-not-allowed opacity-40"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
            </a>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) =>
              setOpenDropdownId(isOpen ? row._id : null)
            }
          >
            <SimpleTooltip
              content="More"
              position="top"
              disabled={openDropdownId === row._id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className={`${ACTION_BUTTON} hover:border-destructive/50 hover:text-destructive`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="right" className="min-w-40 p-1 font-medium">
              {onUpdateStatus && (
                <>
                  <DropdownLabel className="text-[9px] items-center gap-1.5 uppercase tracking-wider text-muted-foreground py-1.5 pb-2 pl-0 flex">
                    Move To
                  </DropdownLabel>
                  {row.status !== "shortlisted" && (
                    <DropdownItem
                      icon={<Star className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "shortlisted");
                      }}
                      className="text-primary text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Shortlist
                    </DropdownItem>
                  )}
                  {row.status !== "hired" && (
                    <DropdownItem
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "hired");
                      }}
                      className="text-success text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Mark Hired
                    </DropdownItem>
                  )}
                  {row.status !== "rejected" && (
                    <DropdownItem
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "rejected");
                      }}
                      className="text-destructive text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Reject
                    </DropdownItem>
                  )}
                  <DropdownSeparator />
                </>
              )}

              <DropdownItem
                icon={<Trash2 className="size-3.5" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(row);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete Application
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h3 className="text-xl font-medium text-foreground">
          All Applications
        </h3>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-50">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search applicants..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-40">
            <SimpleSelect
              options={postFilterOptions}
              value={postFilter}
              onChange={onPostFilterChange}
              className="h-10 rounded-md bg-card"
            />
          </div>

          <div className="relative w-32">
            <SimpleSelect
              options={APPLICATION_STATUS_FILTER_OPTIONS.map((o) => ({
                value: String(o.value),
                label: o.label,
              }))}
              value={statusFilter}
              onChange={onStatusFilterChange}
              className="h-10 rounded-md bg-card"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<JobApplication>
        data={applications}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyMessage="No applications found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
      />

      {/* View */}
      <ApplicationViewDrawer
        open={!!viewing}
        application={viewing}
        onClose={() => setViewing(null)}
        onUpdateStatus={onUpdateStatus}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Application"
        text={`Delete the application from "${toDelete?.fullName}"? It will be archived and hidden from the panel; their CV is kept.`}
        deleteModal={!!toDelete}
        setDeleteModal={(open) => {
          if (!open) setToDelete(null);
        }}
        selectedRow={toDelete}
        isLoading={deleting}
        handleDelete={async (row) => {
          if (!row) return;
          await onDelete?.(row);
          setToDelete(null);
        }}
      />
    </div>
  );
}
