"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  SupportLearningVideo,
  SupportResource,
} from "../../_types/support.types";
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
import VideoModal from "./VideoModal";
import VideoViewDrawer from "./VideoViewDrawer";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  MoreIcon,
} from "@/components/icons/Icons";
import { Eye, Trash2, PlayCircle, Globe, FileEdit, Clock } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
};

interface VideoListTableProps {
  videos: SupportLearningVideo[];
  resources: SupportResource[];
}

export default function VideoListTable({
  videos: initialVideos,
  resources,
}: VideoListTableProps) {
  const [videos, setVideos] = useState<SupportLearningVideo[]>(initialVideos);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<SupportLearningVideo | null>(null);
  const [viewing, setViewing] = useState<SupportLearningVideo | null>(null);
  const [deleting, setDeleting] = useState<SupportLearningVideo | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = videos.filter((v) => {
    const matchSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.tags.some((t) => t.includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchResource =
      resourceFilter === "all" || v.resourceId === resourceFilter;
    return matchSearch && matchStatus && matchResource;
  });

  const handleSave = (data: Partial<SupportLearningVideo>) => {
    setVideos((prev) => {
      const exists = prev.find((v) => v.id === data.id);
      if (exists) {
        return prev.map((v) => (v.id === data.id ? { ...v, ...data } : v));
      }
      return [data as SupportLearningVideo, ...prev];
    });
    setIsAddOpen(false);
    setEditing(null);
  };

  const handleDelete = (row: SupportLearningVideo | null) => {
    if (!row) return;
    setVideos((prev) => prev.filter((v) => v.id !== row.id));
    setDeleting(null);
  };

  const handleUpdateStatus = (id: string, status: "published" | "draft") => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  };

  const resourceOptions = [
    { value: "all", label: "All Resources" },
    ...resources.map((r) => ({ value: r.id, label: `${r.icon} ${r.name}` })),
  ];
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ];

  const columns: Column<SupportLearningVideo>[] = [
    {
      id: "title",
      header: "Video",
      cell: (_v, row) => {
        const res = resources.find((r) => r.id === row.resourceId);
        return (
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="relative w-14 h-10 rounded-lg bg-gray-100 dark:bg-darkBorder overflow-hidden shrink-0 group">
              {row.thumbnailUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.thumbnailUrl}
                    alt={row.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <PlayCircle className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text5">
                  <PlayCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-semibold text-black dark:text-white truncate">
                {row.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {res && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400">
                    {res.icon} {res.name}
                  </span>
                )}
                {row.duration && (
                  <span className="flex items-center gap-0.5 text-[10px] text-text5">
                    <Clock className="w-3 h-3" />
                    {row.duration}
                  </span>
                )}
              </div>
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
      id: "createdAt",
      header: "Added",
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
      id: "id" as keyof SupportLearningVideo,
      header: "Actions",
      className: "justify-end text-right",
      cell: (_v, row) => (
        <div className="flex items-center justify-end gap-1 relative">
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
              <DropdownItem
                icon={<PlayCircle className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(row.videoUrl, "_blank", "noopener,noreferrer");
                }}
                className="text-rose-600 dark:text-rose-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                Watch Video
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
                Delete Video
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
          Learning Videos
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-48">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
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
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 h-10 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Video
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<SupportLearningVideo>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        bordered
        emptyMessage="No learning videos found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
      />

      {/* Add / Edit Modal */}
      {(isAddOpen || editing) && (
        <VideoModal
          video={editing}
          resources={resources}
          onClose={() => {
            setIsAddOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* View Drawer */}
      {viewing && (
        <VideoViewDrawer
          video={viewing}
          resource={resources.find((r) => r.id === viewing.resourceId)}
          onClose={() => setViewing(null)}
          onEdit={() => setEditing(viewing)}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Video"
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
