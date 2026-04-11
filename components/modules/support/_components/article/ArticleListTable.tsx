"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { SupportArticle, SupportResource } from "../../_types/support.types";
import { Input, SimpleSelect } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown/Dropdown";
import ArticleViewDrawer from "./ArticleViewDrawer";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  MoreIcon,
} from "@/components/icons/Icons";
import { Eye, Trash2, Globe, FileEdit, Archive } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  archived:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
};

interface ArticleListTableProps {
  articles: SupportArticle[];
  resources: SupportResource[];
}

export default function ArticleListTable({
  articles: initialArticles,
  resources,
}: ArticleListTableProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<SupportArticle[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [viewing, setViewing] = useState<SupportArticle | null>(null);
  const [deleting, setDeleting] = useState<SupportArticle | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = articles.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchResource =
      resourceFilter === "all" || a.resourceId === resourceFilter;
    return matchSearch && matchStatus && matchResource;
  });

  const handleDelete = (row: SupportArticle | null) => {
    if (!row) return;
    setArticles((prev) => prev.filter((a) => a.id !== row.id));
    setDeleting(null);
  };

  const handleUpdateStatus = (
    id: string,
    status: "published" | "draft" | "archived",
  ) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a,
      ),
    );
  };

  const resourceOptions = [
    { value: "all", label: "All Resources" },
    ...resources.map((r) => ({ value: r.id, label: `${r.name}` })),
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ];

  const columns: Column<SupportArticle>[] = [
    {
      id: "title",
      header: "Article",
      cell: (_v, row) => {
        const res = resources.find((r) => r.id === row.resourceId);
        return (
          <div className="max-w-60">
            <p className="text-sm font-semibold text-black dark:text-white truncate">
              {row.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400">
                {res?.name ?? "Unknown"}
              </span>
              <span className="text-xs text-text5 truncate">/{row.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "views",
      header: "Views",
      className: "text-center hidden sm:table-cell",
      cell: (_v, row) => (
        <span className="text-sm font-semibold text-text6 dark:text-text5">
          {row.views.toLocaleString()}
        </span>
      ),
    },
    {
      id: "helpful",
      header: "Helpful",
      className: "text-center hidden md:table-cell",
      cell: (_v, row) => (
        <span className="text-sm font-semibold text-text6 dark:text-text5">
          {row.helpful}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Published",
      className: "hidden md:table-cell",
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
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof SupportArticle,
      header: "Actions",
      className: "justify-end text-right",
      cell: (_v, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/support/article/edit/${row.id}`);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
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
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="right" className="min-w-38 p-1 font-medium">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewing(row);
                }}
                className="text-text6 dark:text-text5 text-xs rounded-sm py-2 cursor-pointer"
              >
                View Details
              </DropdownItem>

              <DropdownSeparator />

              {row.status !== "published" && (
                <DropdownItem
                  icon={<Globe className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(row.id, "published");
                  }}
                  className="text-emerald-600 dark:text-emerald-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                >
                  Publish
                </DropdownItem>
              )}
              {row.status !== "draft" && (
                <DropdownItem
                  icon={<FileEdit className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(row.id, "draft");
                  }}
                  className="text-amber-600 dark:text-amber-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  Revert to Draft
                </DropdownItem>
              )}
              {row.status !== "archived" && (
                <DropdownItem
                  icon={<Archive className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(row.id, "archived");
                  }}
                  className="text-slate-600 dark:text-slate-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"
                >
                  Archive
                </DropdownItem>
              )}

              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 className="size-3.5" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleting(row);
                }}
                className="text-xs rounded-sm py-2 cursor-pointer"
              >
                Delete Article
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
        <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
          Articles
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-48">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80"
            />
          </div>

          <div className="relative w-40">
            <SimpleSelect
              options={resourceOptions}
              value={resourceFilter}
              onChange={(val) => setResourceFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>

          <div className="relative w-28">
            <SimpleSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>

          <Button
            onClick={() => router.push("/support/article/add")}
            className="px-3.5 h-10 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Article
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<SupportArticle>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        bordered
        emptyMessage="No articles found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
      />
      {/* View Drawer */}
      {viewing && (
        <ArticleViewDrawer
          article={viewing}
          resource={resources.find((r) => r.id === viewing.resourceId)}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setViewing(null);
            router.push(`/support/article/edit/${viewing.id}`);
          }}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Article"
        text={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
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
