"use client";

import { useState } from "react";
import {
  Promotion,
  Wholesaler,
  PromotionStatus,
  AdvertisementType,
} from "../_types/promotion.types";
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
} from "@/components/ui/dropdown/Dropdown";
import {
  Trash2,
  Eye,
  Image as ImageIcon,
  Video,
  Headphones,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  MoreIcon,
} from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import PromotionViewDrawer from "./PromotionViewDrawer";
import { Select } from "@/components/ui/select/Select";

interface PromotionListTableProps {
  promotions: Promotion[];
  wholesalers: Wholesaler[];
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: PromotionStatus) => void;
}

const STATUS_STYLES: Record<PromotionStatus, string> = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
  inactive:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400 border-slate-100 dark:border-slate-700/50",
  scheduled:
    "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
  expired:
    "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
};

const TYPE_ICONS: Record<AdvertisementType, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  audio: <Headphones className="w-3.5 h-3.5" />,
  pdf: <FileText className="w-3.5 h-3.5" />,
};

function PromotionListTable({
  promotions,
  onDelete,
  onUpdateStatus,
}: PromotionListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(
    null,
  );
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(
    null,
  );

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "scheduled", label: "Scheduled" },
    { value: "expired", label: "Expired" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "pdf", label: "PDF" },
  ];

  const columns: Column<Promotion>[] = [
    {
      id: "title",
      header: "Promotion & Wholesaler",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-darkBorder overflow-hidden shrink-0 border border-border/50">
            {row.bannerImage ? (
              <Image
                src={row.bannerImage}
                alt={row.title}
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="max-w-[200px] sm:max-w-xs">
            <p className="text-sm font-semibold text-black dark:text-white truncate">
              {row.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-[#0284c7] dark:bg-blue-900/20 dark:text-blue-400">
                {row.wholesalerName}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                {TYPE_ICONS[row.adType]}
                {row.adType}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "targetAudience",
      header: "Target",
      className: "hidden lg:table-cell",
      cell: (value, row) => (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md capitalize">
          {row.targetAudience}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      className: "text-center hidden sm:table-cell",
      cell: (value, row) => (
        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-500 border border-border/30">
          {row.priority}
        </div>
      ),
    },
    {
      id: "startDate" as keyof Promotion,
      header: "Validity",
      className: "hidden xl:table-cell",
      cell: (value, row) => (
        <div className="flex flex-col text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-emerald-500 font-medium w-6">S:</span>
            <span>
              {row.startDate
                ? format(new Date(row.startDate), "dd MMM yyyy")
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-rose-500 font-medium w-6">E:</span>
            <span>
              {row.endDate
                ? format(new Date(row.endDate), "dd MMM yyyy")
                : "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md capitalize border ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof Promotion,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={() => router.push(`/promotion/edit/${row.id}`)}
              className="center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-[#0284c7] hover:text-[#0284c7] transition-all cursor-pointer"
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
                <button className="center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                  <MoreIcon className="w-4 h-4" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="end" className="min-w-[180px] p-1.5 ">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={() => setViewingPromotion(row)}
                className="text-xs py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                View Details
              </DropdownItem>

              <DropdownItem
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => window.open(row.mediaUrl, "_blank")}
                className="text-xs py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                Open Media Link
              </DropdownItem>

              <DropdownSeparator className="my-1.5" />
              <DropdownItem
                icon={<Trash2 className="size-3.5" />}
                destructive
                onClick={() => setPromotionToDelete(row)}
                className="text-xs py-2.5 rounded-lg cursor-pointer"
              >
                Delete Promotion
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const filtered = promotions.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.wholesalerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || r.adType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-5">
      {/* Header & Toolbar */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
          Promotions Management
        </h1>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, wholesaler..."
              startIcon={<SearchIcon className="w-4 h-4 text-gray-400" />}
              className="h-10 dark:border-darkBorder dark:focus:border-primary"
            />
          </div>

          <div className="w-32">
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className=" dark:border-darkBorder dark:focus:border-primary"
              fieldClass="h-10!"
            />
          </div>

          <div className="w-32">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className=" w-full"
              fieldClass="h-10!"
            />
          </div>

          <Button
            onClick={() => router.push("/promotion/add")}
            className="h-10"
          >
            <PlusIcon className="size-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div>
        <Table<Promotion>
          data={filtered}
          columns={columns}
          pagination={false}
          emptyMessage="No promotions found matching your criteria"
          tableClassName="min-w-full"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Delete Promotion"
        text={`Are you sure you want to delete "${promotionToDelete?.title}"? This will remove it from all displays.`}
        deleteModal={!!promotionToDelete}
        setDeleteModal={(open) => {
          if (!open) setPromotionToDelete(null);
        }}
        selectedRow={promotionToDelete}
        handleDelete={(row) => {
          if (row) {
            onDelete?.(row.id);
            setPromotionToDelete(null);
          }
        }}
      />

      {/* View Drawer */}
      {viewingPromotion && (
        <PromotionViewDrawer
          promotion={viewingPromotion}
          onClose={() => setViewingPromotion(null)}
          onEdit={() => router.push(`/promotion/edit/${viewingPromotion.id}`)}
        />
      )}
    </div>
  );
}

export default PromotionListTable;
