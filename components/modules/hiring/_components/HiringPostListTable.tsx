"use client";

import { useState } from "react";
import {
  HiringPost,
  HiringCategory,
  HiringStatus,
} from "../_types/hiring.types";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Input } from "@/components/ui";
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
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  MoreIcon,
  EyeIcon,
  DeleteIcon,
  ImageIcon,
} from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Globe, Archive, FileEdit, XCircle, Briefcase } from "lucide-react";

interface HiringPostListTableProps {
  posts: HiringPost[];
  categories: HiringCategory[];
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: HiringStatus) => void;
}

const STATUS_STYLES: Record<HiringStatus, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
  closed: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
};

const JOB_TYPE_STYLES: Record<string, string> = {
  "full-time":
    "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  "part-time":
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
  contract:
    "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  internship: "bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400",
  freelance:
    "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
  remote: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400",
};

export default function HiringPostListTable({
  posts,
  categories,
  onDelete,
  onUpdateStatus,
}: HiringPostListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<HiringPost | null>(null);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "inactive", label: "Inactive" },
    { value: "closed", label: "Closed" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCat =
      categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const columns: Column<HiringPost>[] = [
    {
      id: "title",
      header: "Job & Company",
      cell: (_, row) => {
        const cat = categories.find((c) => c.id === row.categoryId);
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-lg bg-gray-100 dark:bg-darkBorder overflow-hidden shrink-0">
              {row.bannerImage ? (
                <Image
                  src={row.bannerImage}
                  alt={row.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text5">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="max-w-[220px]">
              <p className="text-sm font-semibold text-black dark:text-white truncate">
                {row.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[10px] text-text5 truncate">
                  {row.companyName}
                </span>
                {cat && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400">
                    {cat.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "jobType",
      header: "Type",
      className: "hidden lg:table-cell",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center justify-center text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${JOB_TYPE_STYLES[row.jobType] ?? ""}`}
        >
          {row.jobType.replace("-", " ")}
        </span>
      ),
    },
    {
      id: "salaryMin",
      header: "Salary",
      className: "hidden md:table-cell",
      cell: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-black dark:text-white">
            {row.currency} {row.salaryMin.toLocaleString()}
            {row.salaryMax ? ` – ${row.salaryMax.toLocaleString()}` : "+"}
          </span>
          <span className="text-[10px] text-text5 capitalize">
            /{row.salaryType}
          </span>
        </div>
      ),
    },
    {
      id: "applicationCount",
      header: "Apps",
      className: "text-center hidden sm:table-cell",
      cell: (_, row) => (
        <div className="inline-flex items-center justify-center gap-1">
          <span className="text-sm font-bold text-black dark:text-white">
            {row.applicationCount}
          </span>
        </div>
      ),
    },
    {
      id: "deadline",
      header: "Deadline",
      className: "hidden xl:table-cell",
      cell: (_, row) => (
        <span className="text-xs text-text6 dark:text-text5">
          {row.deadline
            ? format(new Date(row.deadline), "dd MMM yyyy")
            : "Ongoing"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center justify-center text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize min-w-16 ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof HiringPost,
      header: "Actions",
      className: "text-right",
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/hiring/edit/${row.id}`);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? row.id : null)}
          >
            <SimpleTooltip
              content="More"
              position="top"
              disabled={openDropdownId === row.id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:text-rose-500 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="right" className="min-w-40 p-1 font-medium">
              <DropdownItem
                icon={<EyeIcon className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/hiring/view/${row.id}`);
                }}
                className="text-text6 dark:text-text5 text-xs rounded-sm py-2 cursor-pointer"
              >
                View Details
              </DropdownItem>

              <DropdownItem
                icon={<Briefcase className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/hiring/applications?jobId=${row.id}`);
                }}
                className="text-text6 dark:text-text5 text-xs rounded-sm py-2 cursor-pointer"
              >
                View Applications
              </DropdownItem>

              {onUpdateStatus && (
                <>
                  <DropdownSeparator />
                  <DropdownLabel className="text-[9px] items-center gap-1.5 uppercase tracking-wider text-text5 py-1.5 pb-2 pl-0 flex">
                    Status Actions
                  </DropdownLabel>

                  {row.status !== "active" && (
                    <DropdownItem
                      icon={<Globe className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "active");
                      }}
                      className="text-emerald-600 dark:text-emerald-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    >
                      Set Active
                    </DropdownItem>
                  )}
                  {row.status !== "draft" && (
                    <DropdownItem
                      icon={<FileEdit className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "draft");
                      }}
                      className="text-amber-600 dark:text-amber-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20"
                    >
                      Revert to Draft
                    </DropdownItem>
                  )}
                  {row.status !== "closed" && (
                    <DropdownItem
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "closed");
                      }}
                      className="text-rose-600 dark:text-rose-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      Close Posting
                    </DropdownItem>
                  )}
                  {row.status !== "inactive" && (
                    <DropdownItem
                      icon={<Archive className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(row.id, "inactive");
                      }}
                      className="text-slate-600 dark:text-slate-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"
                    >
                      Set Inactive
                    </DropdownItem>
                  )}
                </>
              )}

              <DropdownSeparator />
              <DropdownItem
                icon={<DeleteIcon className="size-3.5" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setPostToDelete(row);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete Post
              </DropdownItem>
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
            Manage Hirings
          </h1>
          <p className="text-xs text-text5 mt-0.5">
            {filtered.length} post{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 min-w-44 sm:w-56">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full  dark:border-darkBorder/80  dark:focus:border-darkLight/80"
            />
          </div>
          <div className="w-44">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              className="w-full"
              fieldClass="h-10!"
            />
          </div>
          <div className="w-28">
            <Select
              options={statusOptions}
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-full"
              fieldClass="h-10!"
            />
          </div>
          <Button
            onClick={() => router.push("/hiring/add")}
            className="h-10 px-3.5 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<HiringPost>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        emptyMessage="No hiring posts found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
      />

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Hiring Post"
        text={`Are you sure you want to delete "${postToDelete?.title}"? This will also remove all associated applications.`}
        deleteModal={!!postToDelete}
        setDeleteModal={(open) => {
          if (!open) setPostToDelete(null);
        }}
        selectedRow={postToDelete}
        handleDelete={(row) => {
          if (row) {
            onDelete?.(row.id);
            setPostToDelete(null);
          }
        }}
      />
    </div>
  );
}
