"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/Button";
import { Product } from "../_types/product.types";
import { UploadCloud, Tag as TagIcon, X, ArrowLeftIcon } from "lucide-react";
import { Input } from "@/components/ui";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import Link from "next/link";

export default function ProductAddForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    slug: "",
    shortDescription: "",
    upc: "",
    sku: "",
    boxUpc: "",
    modifier: "",
    unit: "pcs",
    tag: [],
    image: "",
  });

  const [tagInput, setTagInput] = useState("");

  const handleChange = (field: keyof Product, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from name if slug is empty or matches previous auto-generation
    if (field === "name") {
      const slugVal = value
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, slug: slugVal }));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!formData.tag?.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tag: [...(prev.tag || []), tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tag: prev.tag?.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit Product:", formData);
    // Submit logic here
    router.push("/product/manage");
  };

  return (
    <div className="bg-white dark:bg-darkBg rounded-xl border border-border dark:border-darkBorder/50 shadow-sm p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <Link
          href="/product/manage"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Add Product
          </h1>
          <p className="text-[12px] text-text5 dark:text-text6">
            Create a new product by filling out the details below.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 border-t border-t-border dark:border-t-darkBorder/50 pt-5"
      >
        {/* Core Details */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">
            Core Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              requiredSign
              placeholder="e.g. Organic Coffee Beans"
              value={formData.name || ""}
              onValueChange={(val) => handleChange("name", val)}
              className="dark:border-darkBorder dark:focus:border-darkLight/50"
            />
            <Input
              label="Product Slug"
              requiredSign
              placeholder="e.g. organic-coffee-beans"
              value={formData.slug || ""}
              onValueChange={(val) => handleChange("slug", val)}
              className="dark:border-darkBorder dark:focus:border-darkLight/50"
            />
            <div className="md:col-span-2">
              <Textarea
                label="Short Description"
                requiredSign
                rows={3}
                placeholder="Enter a brief product description..."
                value={formData.shortDescription || ""}
                onChange={(e) =>
                  handleChange("shortDescription", e.target.value)
                }
                className="dark:focus:border-darkLight/50"
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-border dark:bg-darkBorder/50 w-full" />

        {/* Identifiers & Inventory */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">
            Identifiers & Packaging
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="SKU (Stock Keeping Unit)"
              requiredSign
              placeholder="e.g. COF-ORG-1KG"
              value={formData.sku || ""}
              onValueChange={(val) => handleChange("sku", val)}
              className="dark:border-darkBorder uppercase dark:focus:border-darkLight/50"
            />
            <Input
              label="Unit UPC"
              requiredSign
              placeholder="12-digit barcode"
              value={formData.upc || ""}
              onValueChange={(val) => handleChange("upc", val)}
              className="dark:border-darkBorder dark:focus:border-darkLight/50"
            />
            <Input
              label="Box UPC"
              placeholder="14-digit barcode"
              value={formData.boxUpc || ""}
              onValueChange={(val) => handleChange("boxUpc", val)}
              className="dark:border-darkBorder dark:focus:border-darkLight/50"
            />
            <div className="md:col-span-1">
              <Select
                label="Selling Unit"
                options={[
                  { label: "Piece (pcs)", value: "pcs" },
                  { label: "Kilogram (kg)", value: "kg" },
                  { label: "Box", value: "box" },
                  { label: "Pack", value: "pack" },
                ]}
                value={formData.unit || "pcs"}
                onValueChange={(val) => handleChange("unit", val)}
                className="w-full "
                fieldClass="h-11!"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Modifier / Variant"
                placeholder="e.g. Dark Roast, 500ml"
                value={formData.modifier || ""}
                onValueChange={(val) => handleChange("modifier", val)}
                className="dark:border-darkBorder dark:focus:border-darkLight/50"
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-border dark:bg-darkBorder/50 w-full" />

        {/* Media & Metadata */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">
            Media & Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5 cursor-pointer">
                Product Image URL
              </label>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image || ""}
                  onValueChange={(val) => handleChange("image", val)}
                  className="dark:border-darkBorder w-full dark:focus:border-darkLight/50"
                  startIcon={<UploadCloud className="w-4 h-4" />}
                  fullWidth
                />
              </div>
            </div>

            <div>
              <Input
                label="Product Tags"
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="dark:border-darkBorder dark:focus:border-darkLight/50"
                startIcon={<TagIcon className="w-4 h-4" />}
              />
              {formData.tag && formData.tag.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tag.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-red-500 transition-colors focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border dark:border-darkBorder/50">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-[140px]">
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
