"use client";

import { useState } from "react";
import { JobApplication } from "../_types/hiring.types";
import { Input, SimpleSelect } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/dropdown/Dropdown";
import { SearchIcon, EyeIcon, MoreIcon } from "@/components/icons/Icons";
import { format } from "date-fns";
import Image from "next/image";
import { MailIcon } from "lucide-react";
import ApplicationViewDrawer from "./ApplicationViewDrawer";

interface ApplicationListTableProps {
  applications: JobApplication[];
  onStatusChange?: (id: string, status: JobApplication["status"]) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  reviewed: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  shortlisted:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
  rejected: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  hired:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
};

export default function ApplicationListTable({
  applications,
  onStatusChange,
}: ApplicationListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "rejected", label: "Rejected" },
    { value: "hired", label: "Hired" },
  ];

  const filtered = applications.filter((app) => {
    const matchSearch =
      app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(search.toLowerCase()) ||
      app.hiringTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<JobApplication>[] = [
    {
      id: "applicant" as keyof JobApplication,
      header: "Applicant",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center text-primary font-semibold">
            {row.applicantPhoto ? (
              <Image
                src={row.applicantPhoto}
                alt={row.applicantName}
                fill
                className="object-cover"
              />
            ) : (
              row.applicantName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">
              {row.applicantName}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text5">
              <span className="flex items-center gap-1">
                <MailIcon className="w-3 h-3" />
                {row.applicantEmail}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "appliedFor" as keyof JobApplication,
      header: "Applied For",
      className: "hidden md:table-cell",
      cell: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-black dark:text-white truncate max-w-[200px]">
            {row.hiringTitle}
          </span>
          <span className="text-[10px] text-text5">{row.companyName}</span>
        </div>
      ),
    },
    {
      id: "appliedDate" as keyof JobApplication,
      header: "Date",
      className: "hidden lg:table-cell",
      cell: (_, row) => (
        <span className="text-sm text-text6 dark:text-text5">
          {format(new Date(row.appliedAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center justify-center text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize min-w-[80px] ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof JobApplication,
      header: "Actions",
      className: "text-right",
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="View Details" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingApp(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? row.id : null)}
          >
            <SimpleTooltip
              content="Update Status"
              position="top"
              disabled={openDropdownId === row.id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="right" className="min-w-36 p-1">
              {["reviewed", "shortlisted", "hired", "rejected"].map((s) => (
                <DropdownItem
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(row.id, s as JobApplication["status"]);
                  }}
                  className={`text-xs py-2 cursor-pointer capitalize ${row.status === s ? "bg-gray-100 dark:bg-white/5 font-semibold" : ""}`}
                >
                  Mark as {s}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
            Applications
          </h1>
          <p className="text-xs text-text5 mt-0.5">
            {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 min-w-44 sm:w-56">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicant or role..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg"
            />
          </div>
          <div className="w-32">
            <SimpleSelect
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<JobApplication>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        emptyMessage="No applications found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
      />

      {/* View Drawer */}
      {viewingApp && (
        <ApplicationViewDrawer
          application={viewingApp}
          onClose={() => setViewingApp(null)}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}
