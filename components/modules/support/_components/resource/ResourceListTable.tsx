"use client";

import { useState } from "react";
import { format } from "date-fns";
import { SupportResource } from "../../_types/support.types";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import ResourceModal from "./ResourceModal";
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
} from "@/components/icons/Icons";

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
};

interface ResourceListTableProps {
  resources: SupportResource[];
}

export default function ResourceListTable({
  resources: initialResources,
}: ResourceListTableProps) {
  const [resources, setResources] =
    useState<SupportResource[]>(initialResources);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<SupportResource | null>(null);
  const [deleting, setDeleting] = useState<SupportResource | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Partial<SupportResource>) => {
    setResources((prev) => {
      const exists = prev.find((r) => r.id === data.id);
      if (exists) {
        return prev.map((r) => (r.id === data.id ? { ...r, ...data } : r));
      }
      return [data as SupportResource, ...prev];
    });
    setIsAddOpen(false);
    setEditing(null);
  };

  const handleDelete = (row: SupportResource | null) => {
    if (!row) return;
    setResources((prev) => prev.filter((r) => r.id !== row.id));
    setDeleting(null);
  };

  const columns: Column<SupportResource>[] = [
    {
      id: "name",
      header: "Resource",
      cell: (_v, row) => (
        <div>
          <p className="text-sm font-semibold text-black dark:text-white">
            {row.name}
          </p>
          <p className="text-[10px] text-text5">/{row.slug}</p>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      className: "hidden md:table-cell",
      cell: (_v, row) => (
        <p className="text-sm text-text6 dark:text-text5 max-w-xs truncate">
          {row.description}
        </p>
      ),
    },
    {
      id: "articleCount",
      header: "Articles",
      className: "text-center",
      cell: (_v, row) => (
        <span className="text-sm font-semibold text-text6 dark:text-text5">
          {row.articleCount}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden sm:table-cell",
      cell: (_v, row) => (
        <span className="text-sm text-text6 dark:text-text5">
          {format(new Date(row.createdAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (_v, row) => (
        <div
          className={`text-xs  font-semibold w-18 center py-1 rounded-full capitalize ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </div>
      ),
    },
    {
      id: "actions" as keyof SupportResource,
      header: "Actions",
      className: "justify-end text-right",
      cell: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Delete" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleting(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80"
            />
          </div>

          <div className="relative w-32">
            <Select
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
              className="rounded-md bg-white dark:bg-darkBg"
              fieldClass="h-10!"
            />
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
      <Table<SupportResource>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        bordered
        emptyMessage="No resources found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      {/* Add / Edit Modal */}
      {(isAddOpen || editing) && (
        <ResourceModal
          resource={editing}
          onClose={() => {
            setIsAddOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Resource"
        text={`Are you sure you want to delete "${deleting?.name}"? All linked articles may be affected.`}
        deleteModal={!!deleting}
        setDeleteModal={(open) => {
          if (!open) setDeleting(null);
        }}
        selectedRow={deleting}
        handleDelete={handleDelete}
      />
    </div>
  );
}
