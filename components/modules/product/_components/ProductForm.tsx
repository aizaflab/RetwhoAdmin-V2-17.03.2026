"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CloudUploadIcon,
  ImageIcon,
  Tag as TagIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button/Button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Switch,
} from "@/components/ui";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { cn } from "@/lib/utils";

import type { GlobalProduct, ProductPayload } from "../_types/product.types";

interface ProductFormProps {
  /**
   * Must reject on failure — the rejection is what surfaces the API's reason.
   * The file is only ever passed in edit mode; create takes JSON alone.
   */
  onSave: (
    payload: ProductPayload,
    imageFile?: File | null,
  ) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
  /** Present in edit mode: the record being changed, used as the seed state. */
  product?: GlobalProduct | null;
}

const ERROR_FIELD_IDS: [string, string][] = [
  ["name", "product-name"],
  ["upc", "product-upc"],
  ["boxUpc", "product-box-upc"],
  ["percentage", "product-profit-percentage"],
];

const UPC_PATTERN = /^(\d{12}|\d{14})$/;

/** What the upload route accepts, checked before the request is sent. */
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Caps the free-text fields. These are enforced as the user types, so the
 * error messages below only ever fire for what typing cannot prevent — an
 * empty field, a half-typed barcode.
 */
const NAME_MAX = 120;
const DESCRIPTION_MAX = 500;
const TAG_MAX = 24;
const TAGS_MAX = 15;
const SECTION_TITLE =
  "text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4";
const SECTION_GRID = "grid grid-cols-1 md:grid-cols-2  gap-5";
const HINT_SLOT = "min-h-[18px]";
const TOGGLE_CARD =
  "flex h-full cursor-pointer select-none items-center justify-between gap-4 rounded-lg border border-border/70 dark:border-darkBorder/50 px-4 py-3 transition-colors hover:border-primary/50";

/**
 * Which field a duplicate-key error belongs to, and what to call it. The
 * index name is what the error carries — `upc_1`, `boxUpc_1`.
 */
const DUPLICATE_FIELDS: Record<string, { field: string; label: string }> = {
  upc: { field: "upc", label: "Unit UPC" },
  boxUpc: { field: "boxUpc", label: "Box UPC" },
  name: { field: "name", label: "Product name" },
  slug: { field: "name", label: "Product name" },
};

/**
 * The API hands Mongo's raw driver text straight through on a duplicate:
 *
 *   Create failed: E11000 duplicate key error collection:
 *   retwhotest.global_products index: upc_1 dup key: { upc: "12345678912344" }
 *
 * None of that belongs on screen, so the index name is pulled out and the rest
 * discarded. Returns null for anything that is not a duplicate-key error.
 */
function parseDuplicate(
  message: string,
): { field: string; message: string } | null {
  if (!/E11000|duplicate key/i.test(message)) return null;

  const indexName = message.match(/index:\s*([A-Za-z0-9_]+?)_-?\d+/)?.[1];
  const known = indexName ? DUPLICATE_FIELDS[indexName] : undefined;

  // An index this form does not know about still gets a readable message,
  // just not one pinned to a field.
  if (!known) {
    return {
      field: "upc",
      message: "A product with these details already exists.",
    };
  }

  return {
    field: known.field,
    message: `This ${known.label} is already used by another product.`,
  };
}

interface ToggleCardProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * A switch whose whole card is the hit area. The Switch keeps its own click —
 * hence the guard, since a click on it bubbles up here too and a second toggle
 * would cancel the first. That also leaves Space/Enter on the focused switch
 * working, which a wrapping div alone would not.
 */
function ToggleCard({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: ToggleCardProps) {
  return (
    <div
      className={TOGGLE_CARD}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[role="switch"]')) return;
        onCheckedChange(!checked);
      }}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-black dark:text-white">
          {title}
        </p>
        <p className="text-[11px] text-text5 dark:text-text6">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  );
}

export default function ProductForm({
  onSave,
  saving = false,
  product,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  // Field names match the API body, so this state is the payload apart from
  // the numeric coercion `percentage` needs.
  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    tags: (product?.tags ?? []) as string[],
    upc: product?.upc ?? "",
    boxUpc: product?.boxUpc ?? "",
    isGlobal: product?.isGlobal ?? true,
    profitEnabled: product?.profit?.enabled ?? false,
    percentage:
      product?.profit?.percentage != null
        ? String(product.profit.percentage)
        : "",
  });

  /** The newly picked file, or null while the stored image is being kept. */
  const [imageFile, setImageFile] = useState<File | null>(null);
  /** The image already on the product; cleared when it is removed. */
  const [storedImageUrl, setStoredImageUrl] = useState(
    product?.image?.url ?? "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState("");

  // Derived rather than stored, so picking a file does not need a second
  // render pass to show its preview.
  const objectUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  // An object URL pins the file in memory until it is revoked, so each one is
  // released as soon as it is replaced or the form goes away.
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  // A freshly picked file always wins over whatever was stored.
  const imagePreview = objectUrl || storedImageUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file twice still fires a change event.
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Upload a JPG, PNG or WebP image",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, image: "Image must be under 10MB" }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setStoredImageUrl("");
  };

  const atTagLimit = formData.tags.length >= TAGS_MAX;

  const set = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clearing as the user types is what makes a corrected field stop
    // shouting before the next submit.
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /** Barcodes are digits only, so non-digits never make it into state. */
  const setBarcode = (field: "upc" | "boxUpc", value: string) =>
    set(field, value.replace(/\D/g, "").slice(0, 14));

  /**
   * A percentage, kept inside 0–100 while it is typed rather than only being
   * complained about on submit. The field is a text input — `type="number"`
   * lets `e`, `+` and a mouse wheel past any min/max it is given.
   */
  const setPercentage = (value: string) => {
    const [digits = "", ...rest] = value.replace(/[^\d.]/g, "").split(".");
    // `007` is the same number as `7`, so it never gets to look otherwise.
    const whole = digits.replace(/^0+(?=\d)/, "").slice(0, 3);

    // Only the first dot counts as the separator; the rest are dropped.
    const next = rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;

    // A keystroke that would push the value over 100 is ignored, so the field
    // never holds a number the API would reject.
    if (next !== "" && Number(next) > 100) return;

    set("percentage", next.startsWith(".") ? `0${next}` : next);
  };

  const addTag = () => {
    const tag = tagDraft.trim().slice(0, TAG_MAX);
    // Case-insensitive, so "Audio" cannot join "audio" already in the list.
    const isDuplicate = formData.tags.some(
      (t) => t.toLowerCase() === tag.toLowerCase(),
    );

    if (!tag || isDuplicate || formData.tags.length >= TAGS_MAX) {
      setTagDraft("");
      return;
    }
    set("tags", [...formData.tags, tag]);
    setTagDraft("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addTag();
  };

  const removeTag = (tag: string) =>
    set(
      "tags",
      formData.tags.filter((t) => t !== tag),
    );

  const validate = () => {
    const next: Record<string, string> = {};

    if (!formData.name.trim()) next.name = "Product name is required";
    else if (formData.name.trim().length < 2)
      next.name = "Name must be at least 2 characters";

    if (!formData.upc) next.upc = "UPC is required";
    else if (!UPC_PATTERN.test(formData.upc))
      next.upc = "UPC must be either 12 or 14 digits";

    if (!formData.boxUpc) next.boxUpc = "Box UPC is required";
    else if (!UPC_PATTERN.test(formData.boxUpc))
      next.boxUpc = "Box UPC must be either 12 or 14 digits";
    // A box and the unit inside it are different things, so one barcode
    // cannot stand for both.
    else if (formData.boxUpc === formData.upc)
      next.boxUpc = "Box UPC must differ from the unit UPC";

    // The percentage only ships when profit is on, so it is only checked then.
    if (formData.profitEnabled) {
      const percentage = Number(formData.percentage);
      if (formData.percentage === "" || Number.isNaN(percentage))
        next.percentage = "Enter a profit percentage";
      else if (percentage <= 0 || percentage > 100)
        next.percentage = "Percentage must be between 0 and 100";
    }

    setErrors(next);
    return next;
  };

  const revealFirstError = (errs: Record<string, string>) => {
    const first = ERROR_FIELD_IDS.find(([key]) => errs[key]);
    if (!first) return;

    const el = document.getElementById(first[1]);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      revealFirstError(errs);
      toast.error("Please fill in the highlighted fields.");
      return;
    }

    const name = formData.name.trim();

    // Optional fields are omitted rather than sent empty — the API's schema is
    // strict about the shapes it accepts.
    const payload: ProductPayload = {
      name,
      upc: formData.upc,
      boxUpc: formData.boxUpc,
      isGlobal: formData.isGlobal,
      ...(formData.description.trim()
        ? { description: formData.description.trim() }
        : {}),
      ...(formData.tags.length ? { tags: formData.tags } : {}),
      ...(formData.profitEnabled
        ? {
            profit: {
              enabled: true,
              percentage: Number(formData.percentage),
            },
          }
        : {}),
    };

    try {
      await onSave(payload, imageFile);
      toast.success(
        `Product "${name}" ${isEdit ? "updated" : "created"} successfully`,
      );
      router.push("/product/manage");
    } catch (error) {
      const raw = getApiErrorMessage(
        error,
        `Could not ${isEdit ? "update" : "create"} the product. Please try again.`,
      );

      // A barcode already in the collection comes back either as a 409 or as
      // Mongo's raw E11000 text, depending on where it was caught server-side.
      const duplicate = parseDuplicate(raw);

      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          [duplicate.field]: duplicate.message,
        }));
        revealFirstError({ [duplicate.field]: duplicate.message });
        toast.error(duplicate.message);
        return;
      }

      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, upc: raw }));
      }

      toast.error(raw);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-xl border border-border/50 bg-card text-card-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <Link
          href="/product/manage"
          className="flex shrink-0 items-center justify-center w-9 h-9 rounded-xl border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white">
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-[12px] text-text5 dark:text-text6">
            {isEdit
              ? "Update this product's details below."
              : "Create a new product by filling out the details below."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 border-t border-t-border/50 pt-5"
      >
        <div className="grid grid-cols-2 gap-5">
          {/* Core Details */}
          <section>
            <h3 className={SECTION_TITLE}>Core Details</h3>
            <div className={""}>
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="product-name">
                  Product Name
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="product-name"
                  name="name"
                  placeholder="e.g. Wireless Bluetooth Headphones"
                  value={formData.name}
                  // A leading space would survive `trim()` on submit but make
                  // the field look empty while it is being typed.
                  onValueChange={(val) =>
                    set("name", val.replace(/^\s+/, "").slice(0, NAME_MAX))
                  }
                  maxLength={NAME_MAX}
                  aria-invalid={errors.name ? true : undefined}
                  className="bg-transparent"
                />
                <div className={HINT_SLOT}>
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </div>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="product-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="product-description"
                  name="description"
                  rows={3}
                  resize="none"
                  placeholder="e.g. High-quality noise canceling over-ear headphones."
                  value={formData.description}
                  onChange={(e) =>
                    set(
                      "description",
                      e.target.value
                        .replace(/^\s+/, "")
                        .slice(0, DESCRIPTION_MAX),
                    )
                  }
                  maxLength={DESCRIPTION_MAX}
                  className="bg-transparent"
                />
                <div className={cn(HINT_SLOT, "text-right")}>
                  <FieldDescription>
                    {formData.description.length}/{DESCRIPTION_MAX}
                  </FieldDescription>
                </div>
              </Field>
            </div>
          </section>

          {/* Barcodes */}
          <section>
            <h3 className={SECTION_TITLE}>Barcodes</h3>
            <div className="space-y-5">
              <Field>
                <FieldLabel htmlFor="product-upc">
                  Unit UPC
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="product-upc"
                  name="upc"
                  inputMode="numeric"
                  placeholder="12 or 14 digit barcode"
                  value={formData.upc}
                  onValueChange={(val) => setBarcode("upc", val)}
                  aria-invalid={errors.upc ? true : undefined}
                  className="bg-transparent"
                />
                <div className={HINT_SLOT}>
                  {errors.upc ? (
                    <FieldError>{errors.upc}</FieldError>
                  ) : (
                    <FieldDescription>
                      Must be exactly 12 or 14 digits.
                    </FieldDescription>
                  )}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="product-box-upc">
                  Box UPC
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="product-box-upc"
                  name="boxUpc"
                  inputMode="numeric"
                  placeholder="12 or 14 digit barcode"
                  value={formData.boxUpc}
                  onValueChange={(val) => setBarcode("boxUpc", val)}
                  aria-invalid={errors.boxUpc ? true : undefined}
                  className="bg-transparent"
                />
                <div className={HINT_SLOT}>
                  {errors.boxUpc ? (
                    <FieldError>{errors.boxUpc}</FieldError>
                  ) : (
                    <FieldDescription>
                      Must be exactly 12 or 14 digits.
                    </FieldDescription>
                  )}
                </div>
              </Field>
            </div>
          </section>
        </div>

        <div className="h-px bg-border/50 w-full" />

        {/* Only the update endpoint takes a file, so the picker would be a
            promise this form could not keep on create. */}
        {isEdit && (
          <>
            <section>
              <h3 className={SECTION_TITLE}>Product Image</h3>
              {/* Two halves of one row: the picker on the left, what was
                  picked on the right. */}
              <div className={SECTION_GRID}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  className={cn(
                    "flex min-h-45 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                    errors.image
                      ? "border-destructive"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
                      <CloudUploadIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-primary">
                          {imagePreview
                            ? "Click to replace"
                            : "Click to upload"}
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or WebP — max 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview half — a placeholder until there is something to
                    show, so the row never reads as a broken box. */}
                <div className="relative flex min-h-45 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt={formData.name || "Product image"}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-contain p-2"
                        // Blob previews and S3 URLs both bypass the optimiser.
                        unoptimized
                      />
                      {/* Sits over the image, so it needs its own contrast. */}
                      <button
                        type="button"
                        onClick={clearImage}
                        aria-label="Remove image"
                        className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white shadow transition-colors hover:bg-black/70"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-6 text-center">
                      <ImageIcon className="h-7 w-7 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground">
                        No image yet. Upload one to see it here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className={HINT_SLOT}>
                {errors.image ? (
                  <FieldError>{errors.image}</FieldError>
                ) : (
                  imagePreview &&
                  !imageFile && (
                    <FieldDescription>
                      Keeping the current image. Pick a new file to replace it.
                    </FieldDescription>
                  )
                )}
              </div>
            </section>

            <div className="h-px bg-border/50 w-full" />
          </>
        )}

        {/* Profit & Visibility */}
        <section>
          <h3 className={SECTION_TITLE}>Profit &amp; Visibility</h3>
          <div className={SECTION_GRID}>
            {/* Row one: the two switches, side by side and the same height. */}
            <ToggleCard
              id="product-profit-enabled"
              title="Enable Profit Margin"
              description="Adds a percentage margin on top of the base price."
              checked={formData.profitEnabled}
              onCheckedChange={(checked) => set("profitEnabled", checked)}
            />

            <ToggleCard
              id="product-is-global"
              title="Global Product"
              description="Available to every shop in the catalog."
              checked={formData.isGlobal}
              onCheckedChange={(checked) => set("isGlobal", checked)}
            />

            {/* Row two: only asked for once the margin is on, and it lands in
                the column under the switch that turned it on. */}
            {formData.profitEnabled && (
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="product-profit-percentage">
                  Profit Percentage (%)
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="product-profit-percentage"
                  name="percentage"
                  inputMode="decimal"
                  placeholder="e.g. 15.5"
                  value={formData.percentage}
                  onValueChange={setPercentage}
                  aria-invalid={errors.percentage ? true : undefined}
                  className="bg-transparent"
                />
                <div className={HINT_SLOT}>
                  {errors.percentage ? (
                    <FieldError>{errors.percentage}</FieldError>
                  ) : (
                    <FieldDescription>
                      A value between 0 and 100.
                    </FieldDescription>
                  )}
                </div>
              </Field>
            )}
          </div>
        </section>

        <div className="h-px bg-border/50 w-full" />

        {/* Tags */}
        <section>
          <h3 className={SECTION_TITLE}>Tags</h3>
          <div className={""}>
            <Field>
              <FieldLabel htmlFor="product-tags">Product Tags</FieldLabel>
              <Input
                id="product-tags"
                name="tags"
                placeholder={
                  atTagLimit
                    ? `Tag limit reached (${TAGS_MAX})`
                    : "Type a tag and press Enter"
                }
                value={tagDraft}
                onValueChange={(val) =>
                  setTagDraft(val.replace(/^\s+/, "").slice(0, TAG_MAX))
                }
                onKeyDown={handleTagKeyDown}
                maxLength={TAG_MAX}
                disabled={atTagLimit}
                startIcon={<TagIcon className="w-4 h-4" />}
                className="bg-transparent"
              />
              <div className={HINT_SLOT}>
                <FieldDescription>
                  Press Enter to add each tag — up to {TAGS_MAX}, {TAG_MAX}{" "}
                  characters each.
                </FieldDescription>
              </div>
            </Field>

            {/* The chips take the second column, so adding one grows sideways
                instead of pushing the buttons down. The padding drops them to
                the input's baseline, past the label. */}
            <div className="md:pt-5">
              {formData.tags.length > 0 ? (
                <div className="flex flex-wrap content-start gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove ${tag}`}
                        className="hover:text-destructive transition-colors focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-text5 dark:text-text6">
                  No tags added yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="min-w-35"
            loading={saving}
            loadingText={isEdit ? "Saving..." : "Creating..."}
          >
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
