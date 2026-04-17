"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "../_types/product.types";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import { Input } from "@/components/ui/input/Input";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/dropdown/Dropdown";
import {
  Edit2,
  Trash2,
  MoreVertical,
  Eye,
  Tag as TagIcon,
  Package2,
} from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";

interface ProductListTableProps {
  products: Product[];
  title: string;
}

export default function ProductListTable({
  products,
  title,
}: ProductListTableProps) {
  const [search, setSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const columns: Column<Product>[] = [
    {
      id: "name",
      header: "Product Details",
      cell: (value, product) => (
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0 overflow-hidden border border-primary/20">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package2 className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="max-w-[200px] sm:max-w-[300px]">
            <p
              className="text-sm font-semibold text-black dark:text-white line-clamp-1"
              title={product.name}
            >
              {product.name}
            </p>
            <p
              className="text-[11px] font-medium text-text5 mt-0.5 line-clamp-1"
              title={product.shortDescription}
            >
              {product.shortDescription}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "sku",
      header: "Identifiers",
      className: "hidden sm:table-cell",
      cell: (value, product) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-medium text-black dark:text-white">
            <span className="text-text5 mr-1 font-normal">SKU:</span>
            {product.sku}
          </span>
          <span className="text-[11px] text-text5 flex items-center gap-1">
            UPC: {product.upc}
          </span>
        </div>
      ),
    },
    {
      id: "unit",
      header: "Packaging",
      cell: (value, product) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-black dark:text-white capitalize">
            {product.unit}
          </span>
          {product.modifier && (
            <span className="text-[11px] text-text5 bg-primary/5 dark:bg-primary/10 px-1.5 py-0.5 rounded w-fit">
              {product.modifier}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "tag",
      header: "Tags",
      className: "hidden md:table-cell",
      cell: (value, product) => (
        <div className="flex items-center gap-1.5 max-w-[150px]">
          {product.tag.slice(0, 2).map((t, idx) => (
            <span
              key={idx}
              className="inline-flex flex-row items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <TagIcon className="w-2.5 h-2.5" />
              {t}
            </span>
          ))}
          {product.tag.length > 2 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              +{product.tag.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions" as keyof Product,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, product) => (
        <div className="flex items-center justify-end gap-1.5 relative">
          <SimpleTooltip content="Edit Product" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to edit page or open modal
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-150"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) =>
              setOpenDropdownId(isOpen ? product.id || "" : null)
            }
          >
            <SimpleTooltip
              content="More Options"
              position="top"
              disabled={openDropdownId === product.id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-rose-400/10 hover:text-rose-500 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu
              align="end"
              className="min-w-[160px] p-1.5 font-medium shadow-md border dark:border-darkBorder rounded-xl"
            >
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-text6 dark:text-text5 text-[13px] rounded-md py-2 cursor-pointer"
              >
                View Details
              </DropdownItem>
              <div className="h-px w-full bg-border dark:bg-darkBorder my-1" />
              <DropdownItem
                icon={<Trash2 className="size-4" />}
                destructive
                onClick={(e) => {
                  e.stopPropagation();
                  setProductToDelete(product);
                }}
                className="text-[13px] rounded-md py-2 cursor-pointer"
              >
                Delete Product
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.upc.includes(term)
    );
  });

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h3 className="sm:text-2xl text-xl font-medium">{title}</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg dark:border-darkBorder/80 dark:focus:border-darkLight/50"
            />
          </div>
        </div>
      </div>

      <Table<Product>
        data={filtered}
        columns={columns}
        pagination={false}
        bordered
        emptyMessage="No products found"
        headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
        tableClassName="min-w-full"
        rowClass="py-2.5"
      />

      <DeleteModal
        title="Delete Product?"
        text={`Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`}
        deleteModal={!!productToDelete}
        setDeleteModal={(open) => {
          if (!open) setProductToDelete(null);
        }}
        selectedRow={productToDelete}
        handleDelete={(product) => {
          if (product) {
            console.log("Delete product", product.id);
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
}
