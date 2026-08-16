"use client";

import { useState } from "react";
import { HiringCategory } from "../_types/hiring.types";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  DeleteIcon,
} from "@/components/icons/Icons";
import { format } from "date-fns";
import { Briefcase, Wrench } from "lucide-react";
import HiringCategoryModal from "./HiringCategoryModal";

const STATUS_STYLES = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
};

const TYPE_STYLES = {
  job: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  service:
    "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
};

export default function HiringCategoryListTable({
  categories,
}: {
  categories: HiringCategory[];
}) {
  const [items, setItems] = useState<HiringCategory[]>(categories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [catToDelete, setCatToDelete] = useState<HiringCategory | null>(null);
  const [editingCat, setEditingCat] = useState<HiringCategory | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filtered = items.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const columns: Column<HiringCategory>[] = [
    {
      id: "name",
      header: "Category",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
              row.type === "job"
                ? "bg-blue-50 dark:bg-blue-950/30"
                : "bg-purple-50 dark:bg-purple-950/30"
            }`}
          >
            {row.type === "job" ? (
              <Briefcase className="w-4 h-4 text-blue-500" />
            ) : (
              <Wrench className="w-4 h-4 text-purple-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.name}</p>
            <p className="text-[10px] text-muted-foreground">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      className: "text-center hidden sm:table-cell",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TYPE_STYLES[row.type]}`}
        >
          {row.type}
        </span>
      ),
    },
    {
      id: "postCount",
      header: "Posts",
      className: "text-center",
      cell: (_, row) => (
        <span className="text-sm font-semibold text-foreground">
          {row.postCount}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "text-left hidden md:table-cell",
      cell: (_, row) => (
        <span className="text-sm text-foreground">
          {format(new Date(row.createdAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (_, row) => (
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof HiringCategory,
      header: "Actions",
      className: "text-right",
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingCat(row);
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
                setCatToDelete(row);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
            >
              <DeleteIcon className="w-4 h-4" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "job", label: "Job" },
    { value: "service", label: "Service" },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h1 className="sm:text-2xl text-xl font-medium text-foreground">
            Hiring Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage job and service categories
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-52 min-w-44">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>
          <div className="w-28">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 bg-card">
                <SelectValue options={typeOptions} placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={typeOptions} />
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 bg-card">
                <SelectValue options={statusOptions} placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={statusOptions} />
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-10 px-3.5 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<HiringCategory>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        bordered
        emptyMessage="No categories found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      {/* Add / Edit Modal */}
      {(isAddOpen || editingCat) && (
        <HiringCategoryModal
          category={editingCat}
          onClose={() => {
            setIsAddOpen(false);
            setEditingCat(null);
          }}
          onSave={(data) => {
            if (editingCat) {
              setItems((prev) =>
                prev.map((c) =>
                  c.id === editingCat.id ? { ...c, ...data } : c,
                ),
              );
            } else {
              setItems((prev) => [
                ...prev,
                {
                  ...data,
                  id: `hcat_${Date.now()}`,
                  postCount: 0,
                  createdAt: new Date().toISOString(),
                } as HiringCategory,
              ]);
            }
            setIsAddOpen(false);
            setEditingCat(null);
          }}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Category"
        text={`Are you sure you want to delete "${catToDelete?.name}"? This cannot be undone.`}
        deleteModal={!!catToDelete}
        setDeleteModal={(open) => {
          if (!open) setCatToDelete(null);
        }}
        selectedRow={catToDelete}
        handleDelete={(row) => {
          if (row) {
            setItems((prev) => prev.filter((c) => c.id !== row.id));
            setCatToDelete(null);
          }
        }}
      />
    </div>
  );
}
