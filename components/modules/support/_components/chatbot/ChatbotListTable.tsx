"use client";

import { useState } from "react";
import { format } from "date-fns";
import { SupportChatbotQnA, SupportResource } from "../../_types/support.types";
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
import ChatbotQnAModal from "./ChatbotQnAModal";
import ChatbotViewDrawer from "./ChatbotViewDrawer";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  MoreIcon,
} from "@/components/icons/Icons";
import { Eye, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface ChatbotListTableProps {
  qnaList: SupportChatbotQnA[];
  resources: SupportResource[];
}

export default function ChatbotListTable({
  qnaList: initialList,
  resources,
}: ChatbotListTableProps) {
  const [qnaList, setQnaList] = useState<SupportChatbotQnA[]>(initialList);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<SupportChatbotQnA | null>(null);
  const [viewing, setViewing] = useState<SupportChatbotQnA | null>(null);
  const [deleting, setDeleting] = useState<SupportChatbotQnA | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = qnaList.filter((q) => {
    const matchSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase()) ||
      q.keywords.some((k) => k.includes(search.toLowerCase()));
    const matchResource =
      resourceFilter === "all" || q.resourceId === resourceFilter;
    const matchActive =
      activeFilter === "all" ||
      (activeFilter === "active" ? q.isActive : !q.isActive);
    return matchSearch && matchResource && matchActive;
  });

  const handleSave = (data: Partial<SupportChatbotQnA>) => {
    setQnaList((prev) => {
      const exists = prev.find((q) => q.id === data.id);
      if (exists) {
        return prev.map((q) => (q.id === data.id ? { ...q, ...data } : q));
      }
      return [data as SupportChatbotQnA, ...prev];
    });
    setIsAddOpen(false);
    setEditing(null);
  };

  const handleDelete = (row: SupportChatbotQnA | null) => {
    if (!row) return;
    setQnaList((prev) => prev.filter((q) => q.id !== row.id));
    setDeleting(null);
  };

  const handleToggleActive = (id: string) => {
    setQnaList((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, isActive: !q.isActive, updatedAt: new Date().toISOString() }
          : q,
      ),
    );
  };

  const resourceOptions = [
    { value: "all", label: "All Resources" },
    ...resources.map((r) => ({ value: r.id, label: `${r.name}` })),
  ];
  const activeOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const columns: Column<SupportChatbotQnA>[] = [
    {
      id: "question",
      header: "Question & Answer",
      cell: (_v, row) => {
        const res = resources.find((r) => r.id === row.resourceId);
        return (
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-black dark:text-white line-clamp-1">
              {row.question}
            </p>
            <p className="text-xs text-text5 mt-0.5 line-clamp-1">
              {row.answer}
            </p>
            {res && (
              <span className="mt-1 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400">
                {res.name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "priority",
      header: "Priority",
      className: "text-center hidden sm:table-cell",
      cell: (_v, row) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-blue-400">
          {row.priority}
        </span>
      ),
    },
    {
      id: "keywords" as keyof SupportChatbotQnA,
      header: "Keywords",
      className: "hidden md:table-cell",
      cell: (_v, row) => (
        <div className="flex  gap-1 max-w-36">
          {row.keywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="text-[10px] capitalize font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-darkBorder/50 text-text5"
            >
              {kw}
            </span>
          ))}
          {row.keywords.length > 3 && (
            <span className="text-[10px] text-text5">
              +{row.keywords.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden lg:table-cell",
      cell: (_v, row) => (
        <span className="text-sm text-text6 dark:text-text5">
          {format(new Date(row.createdAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "isActive" as keyof SupportChatbotQnA,
      header: "Status",
      className: "text-center",
      cell: (_v, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(row.id);
          }}
          className={`inline-flex items-center gap-1. text-xs font-semibold w-18 center py-1 rounded-full transition-colors cursor-pointer ${
            row.isActive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      id: "actions" as keyof SupportChatbotQnA,
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

              <DropdownSeparator />

              <DropdownItem
                icon={
                  row.isActive ? (
                    <ToggleLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ToggleRight className="w-3.5 h-3.5" />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive(row.id);
                }}
                className="text-amber-600 dark:text-amber-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                {row.isActive ? "Deactivate" : "Activate"}
              </DropdownItem>

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
                Delete Q&A
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
          Chatbot Q&A
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-48">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
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
              options={activeOptions}
              value={activeFilter}
              onChange={(val) => setActiveFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 h-10 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="size-4.5" />
            Add Q&A
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table<SupportChatbotQnA>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        bordered
        emptyMessage="No Q&A entries found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
      />

      {/* Add / Edit Modal */}
      {(isAddOpen || editing) && (
        <ChatbotQnAModal
          qna={editing}
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
        <ChatbotViewDrawer
          qna={viewing}
          resource={resources.find((r) => r.id === viewing.resourceId)}
          onClose={() => setViewing(null)}
          onEdit={() => setEditing(viewing)}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Q&A"
        text={`Are you sure you want to delete this Q&A? Users will no longer receive this response from the chatbot.`}
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
