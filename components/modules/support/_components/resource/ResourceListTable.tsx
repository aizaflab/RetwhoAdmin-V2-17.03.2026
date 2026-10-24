"use client";

import { useState } from "react";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  EyeIcon,
} from "@/components/icons/Icons";

import {
  SUPPORT_STATUS_FILTER_OPTIONS,
  supportStatusStyle,
} from "../../_data/support-options";
import type {
  SupportResourceItem,
  SupportResourcePayload,
} from "../../_types/support.types";
import ResourceModal from "./ResourceModal";
import ResourceViewDrawer from "./ResourceViewDrawer";

interface ResourceListTableProps {
  resources: SupportResourceItem[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filter / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  /** Create when no id is given, update when there is one. */
  onSaveResource: (
    payload: SupportResourcePayload,
    id?: string,
  ) => Promise<unknown>;
  savingResource?: boolean;
  onDelete?: (resource: SupportResourceItem) => Promise<void> | void;
  deleting?: boolean;
}

const STATUS_FILTER_OPTIONS = SUPPORT_STATUS_FILTER_OPTIONS.map((o) => ({
  value: String(o.value),
  label: o.label,
}));

export default function ResourceListTable({
  resources,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onSaveResource,
  savingResource,
  onDelete,
  deleting,
}: ResourceListTableProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<SupportResourceItem | null>(null);
  const [viewing, setViewing] = useState<SupportResourceItem | null>(null);
  const [deletingRow, setDeletingRow] = useState<SupportResourceItem | null>(
    null,
  );

  const columns: Column<SupportResourceItem>[] = [
    {
      id: "title",
      header: "Resource",
      cell: (_v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/20 shrink-0">
            <BookOpen className="w-4 h-4 text-primary dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate max-w-56">
              {row.title}
            </p>
            <p className="text-[10px] text-muted-foreground truncate max-w-56">
              /{row.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      className: "hidden md:table-cell",
      cell: (_v, row) => (
        <p
          className="text-sm text-muted-foreground max-w-xs truncate"
          title={row.description}
        >
          {row.description}
        </p>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden sm:table-cell",
      cell: (_v, row) => (
        <div>
          <p className="text-sm text-foreground">
            {format(new Date(row.createdAt), "dd MMM yyyy")}
          </p>
          {row.createdBy?.name && (
            <p className="text-[10px] text-muted-foreground">
              by {row.createdBy.name}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "publishedAt",
      header: "Published",
      className: "hidden lg:table-cell",
      cell: (_v, row) => (
        <span className="text-sm text-foreground">
          {row.publishedAt
            ? format(new Date(row.publishedAt), "dd MMM yyyy")
            : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (_v, row) => (
        <span
          className={`text-xs font-semibold px-2.5 w-20 center py-1 rounded-full capitalize ${supportStatusStyle(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof SupportResourceItem,
      header: "Actions",
      className: "justify-end text-right",
      cell: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="View" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewing(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Delete" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingRow(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-destructive/50 hover:text-destructive transition-all duration-150"
            >
              <DeleteIcon className="w-4 h-4" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h1 className="sm:text-2xl text-xl font-medium">Resources</h1>
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-48">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search resources..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-36">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-10 rounded-md bg-card">
                <SelectValue
                  options={STATUS_FILTER_OPTIONS}
                  placeholder="All Status"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={STATUS_FILTER_OPTIONS} />
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 h-10 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<SupportResourceItem>
        data={resources}
        columns={columns}
        loading={loading}
        pagination
        totalData={total}
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        bordered
        onRowClick={setViewing}
        emptyMessage="No resources found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      {/* View */}
      <ResourceViewDrawer
        open={!!viewing}
        resource={viewing}
        onClose={() => setViewing(null)}
        onEdit={(row) => {
          setViewing(null);
          setEditing(row);
        }}
      />

      {/* Add / Edit Modal */}
      {(isAddOpen || editing) && (
        <ResourceModal
          // Remounted per resource so the form is seeded from the row opened.
          key={editing?._id ?? "new"}
          resource={editing}
          onClose={() => {
            setIsAddOpen(false);
            setEditing(null);
          }}
          onSave={onSaveResource}
          saving={savingResource}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Resource"
        text={`Delete the resource "${deletingRow?.title}"? A resource that still holds articles, chatbot answers or videos cannot be deleted.`}
        deleteModal={!!deletingRow}
        setDeleteModal={(open) => {
          if (!open) setDeletingRow(null);
        }}
        selectedRow={deletingRow}
        isLoading={deleting}
        handleDelete={async (row) => {
          if (!row) return;
          await onDelete?.(row);
          // Closed unconditionally: on failure the page has already toasted
          // the reason (content still filed under it).
          setDeletingRow(null);
        }}
      />
    </div>
  );
}
