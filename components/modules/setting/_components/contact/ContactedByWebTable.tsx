"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ContactRequest } from "../../_types/setting.types";
import { Input, SimpleSelect } from "@/components/ui";
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
import { SearchIcon, MoreIcon } from "@/components/icons/Icons";
import ContactViewDrawer from "./ContactViewDrawer";
import {
  Eye,
  Trash2,
  Mail,
  Archive,
  MailOpen,
  MessageSquare,
  MailCheck,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  unread: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  read: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  replied:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  archived:
    "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
};

interface ContactedByWebTableProps {
  contacts: ContactRequest[];
}

export default function ContactedByWebTable({
  contacts: initialContacts,
}: ContactedByWebTableProps) {
  const [contacts, setContacts] = useState<ContactRequest[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<ContactRequest | null>(null);
  const [deleting, setDeleting] = useState<ContactRequest | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, status: ContactRequest["status"]) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
  };

  const handleDelete = (row: ContactRequest | null) => {
    if (!row) return;
    setContacts((prev) => prev.filter((c) => c.id !== row.id));
    setDeleting(null);
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
    { value: "replied", label: "Replied" },
    { value: "archived", label: "Archived" },
  ];

  // Stats summary
  const stats = {
    total: contacts.length,
    unread: contacts.filter((c) => c.status === "unread").length,
    replied: contacts.filter((c) => c.status === "replied").length,
    archived: contacts.filter((c) => c.status === "archived").length,
  };

  const columns: Column<ContactRequest>[] = [
    {
      id: "fullName",
      header: "Sender",
      cell: (_v, row) => (
        <div className="max-w-48">
          <p className="text-sm font-semibold text-black dark:text-white truncate">
            {row.fullName}
          </p>
          <p className="text-xs text-text5 truncate">{row.email}</p>
        </div>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      className: "hidden sm:table-cell",
      cell: (_v, row) => (
        <p className="text-sm text-black dark:text-white truncate max-w-52">
          {row.subject}
        </p>
      ),
    },
    {
      id: "createdAt",
      header: "Received",
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
      id: "id" as keyof ContactRequest,
      header: "Actions",
      className: "justify-end text-right",
      cell: (_v, row) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="View" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewing(row);
                if (row.status === "unread") handleUpdateStatus(row.id, "read");
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <Eye className="w-3.5 h-3.5" />
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

            <DropdownMenu align="right" className="min-w-42 p-1 font-medium">
              {row.status !== "read" && (
                <DropdownItem
                  icon={<MailOpen className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(row.id, "read");
                  }}
                  className="text-blue-600 dark:text-blue-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                  Mark as Read
                </DropdownItem>
              )}
              {row.status !== "replied" && (
                <DropdownItem
                  icon={<MailCheck className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(row.id, "replied");
                  }}
                  className="text-emerald-600 dark:text-emerald-400 text-xs rounded-sm py-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                >
                  Mark as Replied
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
              <DropdownItem
                icon={<Mail className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${row.email}?subject=Re: ${row.subject}`);
                }}
                className="text-text6 dark:text-text5 text-xs rounded-sm py-2 cursor-pointer"
              >
                Reply via Email
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
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4.5 h-4.5 text-primary dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.total}
            </p>
            <p className="text-xs text-text5 mt-0.5">Total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
            <Mail className="w-4.5 h-4.5 text-rose-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.unread}
            </p>
            <p className="text-xs text-text5 mt-0.5">Unread</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
            <MailCheck className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.replied}
            </p>
            <p className="text-xs text-text5 mt-0.5">Replied</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/20">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800/30 flex items-center justify-center shrink-0">
            <Archive className="w-4.5 h-4.5 text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-black dark:text-white leading-none">
              {stats.archived}
            </p>
            <p className="text-xs text-text5 mt-0.5">Archived</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
          Contacted By Web
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56 min-w-48">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80"
            />
          </div>
          <div className="relative w-32">
            <SimpleSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<ContactRequest>
        data={filtered}
        columns={columns}
        pagination
        totalData={filtered.length}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        bordered
        emptyMessage="No contact requests found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
        onRowClick={(row) => {
          setViewing(row);
          if (row.status === "unread") handleUpdateStatus(row.id, "read");
        }}
      />

      {/* View Drawer */}
      {viewing && (
        <ContactViewDrawer
          contact={viewing}
          onClose={() => setViewing(null)}
          onReply={() =>
            window.open(
              `mailto:${viewing.email}?subject=Re: ${viewing.subject}`,
            )
          }
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        title="Delete Contact Request"
        text={`Are you sure you want to delete this contact from "${deleting?.fullName}"? This action cannot be undone.`}
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
