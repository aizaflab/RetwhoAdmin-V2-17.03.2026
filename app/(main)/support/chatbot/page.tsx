"use client";

import { useState } from "react";
import { toast } from "sonner";
import ChatbotListTable from "@/components/modules/support/_components/chatbot/ChatbotListTable";
import type {
  SupportChatbotItem,
  SupportChatbotListQuery,
  SupportChatbotPayload,
  SupportStatus,
} from "@/components/modules/support/_types/support.types";
import {
  useCreateSupportChatbotMutation,
  useDeleteSupportChatbotMutation,
  useGetSupportChatbotsQuery,
  useGetSupportResourceOptionsQuery,
  useUpdateSupportChatbotMutation,
} from "@/featured/support/supportApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";

const STATUS_VERB: Record<SupportStatus, string> = {
  published: "published",
  draft: "moved to draft",
  archived: "archived",
};

export default function SupportChatbotPage() {
  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebouncedValue(search);

  // Any change to what is being listed sends the table back to page 1 — a
  // narrowed result set can have fewer pages than the one currently in view.
  const resetPageWith =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const listQuery: SupportChatbotListQuery = {
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as SupportStatus }
      : {}),
    ...(priorityFilter !== "all" ? { priority: priorityFilter } : {}),
    ...(resourceFilter !== "all" ? { supportResourcesId: resourceFilter } : {}),
  };

  const {
    data: list,
    isLoading,
    isFetching,
  } = useGetSupportChatbotsQuery(listQuery);
  const { data: resourceOptions, isLoading: resourcesLoading } =
    useGetSupportResourceOptionsQuery(undefined);

  const [createChatbot, { isLoading: isCreating }] =
    useCreateSupportChatbotMutation();
  const [updateChatbot, { isLoading: isUpdating }] =
    useUpdateSupportChatbotMutation();
  const [deleteChatbot, { isLoading: isDeleting }] =
    useDeleteSupportChatbotMutation();

  const chatbots = list?.chatbots ?? [];
  const total = list?.meta?.total ?? 0;

  // One handler for both modes — the modal passes an id only when editing.
  // `.unwrap()` rethrows the API error so the modal can show its reason.
  const handleSave = (
    payload: SupportChatbotPayload | Partial<SupportChatbotPayload>,
    id?: string,
  ) =>
    id
      ? updateChatbot({ id, data: payload }).unwrap()
      : createChatbot(payload as SupportChatbotPayload).unwrap();

  const handleUpdateStatus = async (
    qna: SupportChatbotItem,
    status: SupportStatus,
  ) => {
    try {
      await updateChatbot({ id: qna._id, data: { status } }).unwrap();
      toast.success(`Q&A ${STATUS_VERB[status]}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not change the status. Please try again.",
        ),
      );
    }
  };

  const handleDelete = async (qna: SupportChatbotItem) => {
    try {
      await deleteChatbot(qna._id).unwrap();
      toast.success("Q&A deleted successfully");

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (chatbots.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the Q&A. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <ChatbotListTable
        chatbots={chatbots}
        total={total}
        loading={isLoading || isFetching}
        search={search}
        onSearchChange={resetPageWith(setSearch)}
        statusFilter={statusFilter}
        onStatusFilterChange={resetPageWith(setStatusFilter)}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={resetPageWith(setPriorityFilter)}
        resourceFilter={resourceFilter}
        onResourceFilterChange={resetPageWith(setResourceFilter)}
        resourceOptions={resourceOptions ?? []}
        resourcesLoading={resourcesLoading}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={resetPageWith(setLimit)}
        onSave={handleSave}
        saving={isCreating || isUpdating}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
        deleting={isDeleting}
      />
    </div>
  );
}
