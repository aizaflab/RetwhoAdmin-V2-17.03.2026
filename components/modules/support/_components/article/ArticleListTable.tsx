"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Eye, FileEdit, FileText, Globe, Trash2 } from "lucide-react";
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "@/components/ui/dropdown/Dropdown";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  MoreIcon,
} from "@/components/icons/Icons";

import {
  SUPPORT_STATUS_FILTER_OPTIONS,
  resourceRefTitle,
  supportStatusStyle,
} from "../../_data/support-options";
import type {
  SupportArticleItem,
  SupportResourceOption,
  SupportStatus,
} from "../../_types/support.types";
import ArticleViewDrawer from "./ArticleViewDrawer";

interface ArticleListTableProps {
  articles: SupportArticleItem[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filter / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  resourceFilter: string;
  onResourceFilterChange: (value: string) => void;
  resourceOptions: SupportResourceOption[];
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onUpdateStatus?: (
    article: SupportArticleItem,
    status: SupportStatus,
  ) => Promise<void> | void;
  onDelete?: (article: SupportArticleItem) => Promise<void> | void;
  deleting?: boolean;
}

const ACTION_BUTTON =
  "cursor-pointer center w-8 h-8 rounded-lg border border-border/60 bg-card text-foreground transition-all duration-150";

const STATUS_FILTER_OPTIONS = SUPPORT_STATUS_FILTER_OPTIONS.map((o) => ({
  value: String(o.value),
  label: o.label,
}));

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function ArticleListTable({
  articles,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  resourceFilter,
  onResourceFilterChange,
  resourceOptions,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onUpdateStatus,
  onDelete,
  deleting,
}: ArticleListTableProps) {
  const router = useRouter();

  const [viewing, setViewing] = useState<SupportArticleItem | null>(null);
  const [deletingRow, setDeletingRow] = useState<SupportArticleItem | null>(
    null,
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const resourceFilterOptions = [
    { value: "all", label: "All Resources" },
    ...resourceOptions,
  ];

  const editArticle = (row: SupportArticleItem) =>
    router.push(`/support/article/edit/${row._id}`);

  const columns: Column<SupportArticleItem>[] = [
    {
      id: "title",
      header: "Article",
      cell: (_v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/20 shrink-0">
            <FileText className="w-4 h-4 text-primary dark:text-blue-400" />
          </div>
          <div className="min-w-0 max-w-64">
            <p className="text-sm font-semibold text-foreground truncate">
              {row.title}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              /{row.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "supportResourcesId",
      header: "Resource",
      className: "hidden md:table-cell",
      cell: (_v, row) => {
        const resourceTitle = resourceRefTitle(row);
        return resourceTitle ? (
          <span className="inline-block max-w-44 truncate text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400">
            {resourceTitle}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "tags",
      header: "Tags",
      className: "hidden xl:table-cell",
      cell: (_v, row) => {
        const tags = row.tags ?? [];
        if (tags.length === 0)
          return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap items-center gap-1 max-w-48">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-foreground"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <SimpleTooltip content={tags.slice(2).join(", ")} position="top">
                <span className="text-[10px] font-medium text-muted-foreground">
                  +{tags.length - 2}
                </span>
              </SimpleTooltip>
            )}
          </div>
        );
      },
    },
    {
      id: "publishedAt",
      header: "Published",
      className: "hidden lg:table-cell",
      cell: (_v, row) => (
        <span className="text-sm text-foreground">
          {formatDate(row.publishedAt)}
        </span>
      ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      className: "hidden sm:table-cell",
      cell: (_v, row) => (
        <span className="text-sm text-foreground">
          {formatDate(row.updatedAt)}
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
      id: "actions" as keyof SupportArticleItem,
      header: "Actions",
      className: "justify-end text-right",
      cell: (_v, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                editArticle(row);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
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

            <DropdownMenu align="right" className="min-w-37.5 p-1 font-medium">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewing(row);
                }}
                className="text-foreground text-xs rounded-sm py-2 cursor-pointer"
              >
                View Details
              </DropdownItem>

              {onUpdateStatus && (
                <>
                  <DropdownSeparator />
                  <DropdownLabel className="text-[9px] items-center gap-1.5 uppercase tracking-wider text-muted-foreground py-1.5 pb-2 pl-0 flex">
                    Status Actions
                  </DropdownLabel>
                  {row.status !== "published" && (
                    <DropdownItem
                      icon={<Globe className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "published");
                      }}
                      className="text-success text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Publish
                    </DropdownItem>
                  )}
                  {row.status !== "draft" && (
                    <DropdownItem
                      icon={<FileEdit className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "draft");
                      }}
                      className="text-warning text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Revert to Draft
                    </DropdownItem>
                  )}
                  {row.status !== "archived" && (
                    <DropdownItem
                      icon={<Archive className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onUpdateStatus(row, "archived");
                      }}
                      className="text-muted-foreground text-xs rounded-sm py-2 cursor-pointer"
                    >
                      Move to Archive
                    </DropdownItem>
                  )}
                </>
              )}

              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 className="size-3.5" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingRow(row);
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-5">
        <h1 className="sm:text-2xl text-xl font-medium">Articles</h1>
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <div className="relative flex-1 lg:w-56 min-w-48">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search articles..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card"
            />
          </div>

          <div className="relative w-44">
            <Select
              value={resourceFilter}
              onValueChange={onResourceFilterChange}
            >
              <SelectTrigger className="h-10 rounded-md bg-card">
                <SelectValue
                  options={resourceFilterOptions}
                  placeholder="All Resources"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={resourceFilterOptions} />
              </SelectContent>
            </Select>
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
            onClick={() => router.push("/support/article/add")}
            className="px-3.5 h-10 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Article
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<SupportArticleItem>
        data={articles}
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
        emptyMessage="No articles found"
        headerColor="bg-muted/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      {/* View Drawer */}
      <ArticleViewDrawer
        open={!!viewing}
        article={viewing}
        onClose={() => setViewing(null)}
        onEdit={(row) => {
          setViewing(null);
          editArticle(row);
        }}
      />

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Article"
        text={`Delete the article "${deletingRow?.title}"? It will be removed from the help centre.`}
        deleteModal={!!deletingRow}
        setDeleteModal={(open) => {
          if (!open) setDeletingRow(null);
        }}
        selectedRow={deletingRow}
        isLoading={deleting}
        handleDelete={async (row) => {
          if (!row) return;
          await onDelete?.(row);
          setDeletingRow(null);
        }}
      />
    </div>
  );
}
