"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  CloudUploadIcon,
  MoveLeft,
  PlusIcon,
  StoreIcon,
  UtensilsCrossedIcon,
  WarehouseIcon,
  XIcon,
} from "lucide-react";
import {
  Checkbox,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { HugeCalender } from "@/components/ui/calendar/HugeCalender";
import { useGetShopOptionsQuery } from "@/featured/promotion/promotionApiSlice";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

import {
  PROMOTION_STATUS_OPTIONS,
  PROMOTION_TYPE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  audienceLabel,
} from "../_data/promotion-options";
import type {
  Promotion,
  PromotionPayload,
  PromotionStatus,
  PromotionType,
  ShopOption,
  TargetAudience,
} from "../_types/promotion.types";

interface PromotionFormProps {
  /** Present in edit mode; omit to create a new promotion. */
  initialData?: Promotion | null;
  /** Must reject on failure — the rejection is what surfaces the API's reason. */
  onSave: (
    payload: PromotionPayload,
    bannerImageFile: File | null,
  ) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

/**
 * Validation keys paired with the element they belong to, in the order the
 * fields appear on the page — so a failed submit can jump to the first thing
 * that actually needs fixing rather than an arbitrary one.
 */
const ERROR_FIELD_IDS: [string, string][] = [
  ["title", "promo-title"],
  ["videoUrl", "promo-video"],
  ["startDate", "promo-start"],
  ["endDate", "promo-end"],
  ["priority", "promo-priority"],
  ["bannerImage", "promo-banner"],
];

/** Leading option of the shop picker — picking it clears the sponsor. */
const PLATFORM_WIDE_OPTION = { label: "None — platform-wide", value: "" };

/** Card copy for each audience — the API values are terse shop types. */
const AUDIENCE_CARDS: Record<
  TargetAudience,
  { icon: typeof StoreIcon; hint: string }
> = {
  retailer: { icon: StoreIcon, hint: "Stores selling to shoppers" },
  wholesaler: { icon: WarehouseIcon, hint: "Bulk suppliers" },
  restaurant: { icon: UtensilsCrossedIcon, hint: "Food service" },
};

/** Stable fallback so the memo below does not recompute on every render. */
const NO_SHOPS: ShopOption[] = [];

/** The API rejects anything larger, and the browser can check first. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** `2026-08-19T00:00:00.000Z` → `2026-08-19`, which is what the picker holds. */
function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

/**
 * Formats a picked Date as yyyy-mm-dd in *local* time. Going through
 * `toISOString()` directly would shift the day back for anyone east of UTC.
 */
function fromPickedDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function PromotionForm({
  initialData,
  onSave,
  saving = false,
}: PromotionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  // Field names match the API body, so this state object is (almost) the
  // payload — `slug` is absent because the server derives it from the title.
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    promotionType: (initialData?.promotionType ?? "banner") as PromotionType,
    videoUrl: initialData?.videoUrl ?? "",
    targetAudience: (initialData?.targetAudience ?? []) as TargetAudience[],
    shopId: initialData?.shopId ?? "",
    startDate: toDateInput(initialData?.startDate),
    endDate: toDateInput(initialData?.endDate),
    priority: String(initialData?.priority ?? "0"),
    status: (initialData?.status ?? "draft") as PromotionStatus,
    tags: initialData?.tags ?? ([] as string[]),
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [storedBannerUrl, setStoredBannerUrl] = useState(
    initialData?.bannerImage?.url ?? "",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState("");

  // Derived rather than stored, so picking a file does not need a second
  // render pass to show its preview.
  const objectUrl = useMemo(
    () => (bannerFile ? URL.createObjectURL(bannerFile) : ""),
    [bannerFile],
  );

  // An object URL pins the file in memory until it is revoked.
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const bannerPreview = objectUrl || storedBannerUrl;

  // One audience narrows the request server-side; several fetch every shop
  // and the list below narrows it to the ticked types. The picker only shows
  // once an audience is ticked, so there is nothing to fetch before that.
  const audiences = formData.targetAudience;
  const {
    data: shopOptions = NO_SHOPS,
    isFetching: isFetchingShops,
    isError: isShopOptionsError,
  } = useGetShopOptionsQuery(
    audiences.length === 1 ? audiences[0] : undefined,
    { skip: audiences.length === 0 },
  );

  const shopSelectOptions = useMemo(
    () => [
      PLATFORM_WIDE_OPTION,
      ...shopOptions
        .filter((shop) => audiences.includes(shop.businessType))
        .map((shop) => ({
          label: shop.label,
          value: shop.value,
          // With several types ticked the names alone do not say which is which.
          ...(audiences.length > 1
            ? { description: audienceLabel(shop.businessType) }
            : {}),
        })),
    ],
    [shopOptions, audiences],
  );

  // The sponsor's type, from the loaded list or — before it lands in edit
  // mode — from the shop the API embedded in the promotion.
  const selectedShopType =
    shopOptions.find((shop) => shop.value === formData.shopId)?.businessType ??
    (formData.shopId && formData.shopId === initialData?.shopId
      ? initialData?.shop?.businessType
      : undefined);

  // The earliest day the end date may land on. `validate()` wants the end
  // strictly after the start, so the day after — handing the picker the start
  // itself would leave one selectable day that only fails on submit.
  const minEndDate = formData.startDate
    ? new Date(new Date(formData.startDate).getTime() + 24 * 60 * 60 * 1000)
    : undefined;

  const set = (field: string, value: string | string[]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file twice still fires a change event.
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        bannerImage: "Upload a JPG, PNG or WebP image",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        bannerImage: "Image must be under 10MB",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, bannerImage: "" }));
    setBannerFile(file);
  };

  // Takes the wanted state rather than flipping, so a stray repeat event
  // cannot undo the click that caused it.
  const setAudience = (audience: TargetAudience, checked: boolean) => {
    setFormData((prev) => {
      const without = prev.targetAudience.filter((a) => a !== audience);
      const targetAudience = checked ? [...without, audience] : without;

      // Unticking the sponsor's own type would leave a shop selected that the
      // picker no longer offers, so the sponsor goes with it.
      const shopStillOffered =
        !selectedShopType || targetAudience.includes(selectedShopType);

      return {
        ...prev,
        targetAudience,
        shopId:
          shopStillOffered && targetAudience.length > 0 ? prev.shopId : "",
      };
    });
    setErrors((prev) => ({ ...prev, targetAudience: "" }));
  };

  /** Commits the draft as a tag; duplicates and blanks are ignored. */
  const addTag = () => {
    const tag = tagDraft.trim().replace(/,$/, "");
    if (!tag) return;
    setFormData((prev) =>
      prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] },
    );
    setTagDraft("");
  };

  const removeTag = (tag: string) =>
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));

  // Mirrors the API's own rules, so a typo is caught before the round trip.
  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.title.trim()) next.title = "Title is required";
    else if (formData.title.trim().length < 2)
      next.title = "Title must be at least 2 characters";

    // A promotion is a banner, so it needs one: a new promotion needs a file
    // and an edit needs either a new file or the one already stored.
    if (!bannerFile && !bannerPreview)
      next.bannerImage = "A banner image is required";

    if (!formData.startDate) next.startDate = "Start date is required";
    if (!formData.endDate) next.endDate = "End date is required";
    else if (
      formData.startDate &&
      new Date(formData.endDate).getTime() <=
        new Date(formData.startDate).getTime()
    ) {
      next.endDate = "End date must be after the start date";
    }

    // The API refuses a video promotion with no URL outright.
    if (formData.promotionType === "video" && !formData.videoUrl.trim()) {
      next.videoUrl = "A video URL is required for a video promotion";
    }

    const priority = Number(formData.priority);
    if (!Number.isInteger(priority) || priority < 0)
      next.priority = "Priority must be zero or a positive whole number";

    setErrors(next);
    return next;
  };

  /**
   * Puts the first failing field on screen.
   *
   * This form is several screens tall, so a message rendered under a field two
   * sections up is invisible — the submit button just appears to do nothing.
   */
  const revealFirstError = (errs: Record<string, string>) => {
    const first = ERROR_FIELD_IDS.find(([key]) => errs[key]);
    if (!first) return;

    const el = document.getElementById(first[1]);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // The date pickers and the dropzone are not focusable inputs, hence the
    // guard.
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

    const title = formData.title.trim();

    const payload: PromotionPayload = {
      title,
      promotionType: formData.promotionType,
      targetAudience: formData.targetAudience,
      // The API coerces these with `z.coerce.date()`, so a full ISO string is
      // what it expects rather than the yyyy-mm-dd the date input holds.
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      priority: Number(formData.priority),
      status: formData.status,
      tags: formData.tags,
      // An edit sends `null` to drop a sponsor; a create just leaves it out.
      ...(formData.shopId
        ? { shopId: formData.shopId }
        : isEdit
          ? { shopId: null }
          : {}),
      ...(formData.description.trim()
        ? { description: formData.description.trim() }
        : {}),
      ...(formData.videoUrl.trim()
        ? { videoUrl: formData.videoUrl.trim() }
        : {}),
    };

    try {
      await onSave(payload, bannerFile);
      toast.success(
        isEdit
          ? `Promotion "${title}" updated successfully`
          : `Promotion "${title}" created successfully`,
      );
      router.push("/promotion/manage");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        isEdit
          ? "Could not update the promotion. Please try again."
          : "Could not create the promotion. Please try again.",
      );

      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, title: message }));
      }

      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-5 mb-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="size-9 center rounded-lg bg-popover border border-border/50 hover:bg-muted/50 cursor-pointer shrink-0"
        >
          <MoveLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="sm:text-[22px] text-lg font-medium text-foreground">
            {isEdit ? "Edit Promotion" : "Add Promotion"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            A promotion only goes on screen once it is published and inside its
            date window.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-10 px-5 text-muted-foreground"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 px-6"
            loading={saving}
            loadingText="Saving..."
          >
            {isEdit ? "Update Promotion" : "Add Promotion"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left — main details */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-card rounded-lg border border-border/50">
            <h2 className="bg-border/20 p-3 font-semibold text-foreground rounded-t-lg">
              Promotion Details
            </h2>
            <div className="p-3 sm:p-5 space-y-4">
              <Field>
                <FieldLabel htmlFor="promo-title">
                  Title
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="promo-title"
                  name="title"
                  placeholder="e.g. Ramadan Wholesale Offer"
                  value={formData.title}
                  onValueChange={(val) => {
                    set("title", val);
                    if (errors.title)
                      setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  aria-invalid={errors.title ? true : undefined}
                  className="bg-transparent"
                />
                {errors.title ? (
                  <FieldError>{errors.title}</FieldError>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    The URL slug is generated from this title.
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="promo-description">
                  Description{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Textarea
                  id="promo-description"
                  name="description"
                  rows={4}
                  placeholder="What is this promotion about?"
                  value={formData.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="bg-transparent"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel id="promo-type-label" htmlFor="promo-type">
                    Promotion Type
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </FieldLabel>
                  <Select
                    id="promo-type"
                    value={formData.promotionType}
                    onValueChange={(val) => {
                      set("promotionType", val);
                      if (errors.videoUrl)
                        setErrors((prev) => ({ ...prev, videoUrl: "" }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select type"
                        options={PROMOTION_TYPE_OPTIONS}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItems options={PROMOTION_TYPE_OPTIONS} />
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="promo-video">
                    Video URL
                    {formData.promotionType === "video" && (
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                    )}
                  </FieldLabel>
                  <Input
                    id="promo-video"
                    name="videoUrl"
                    type="url"
                    placeholder="https://…"
                    value={formData.videoUrl}
                    onValueChange={(val) => {
                      set("videoUrl", val);
                      if (errors.videoUrl)
                        setErrors((prev) => ({ ...prev, videoUrl: "" }));
                    }}
                    aria-invalid={errors.videoUrl ? true : undefined}
                    className="bg-transparent"
                  />
                  {errors.videoUrl && (
                    <FieldError>{errors.videoUrl}</FieldError>
                  )}
                </Field>
              </div>

              {/* Audience + sponsor */}
              <Field>
                <FieldLabel>
                  Target Audience{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
                  {TARGET_AUDIENCE_OPTIONS.map((option) => {
                    const value = String(option.value) as TargetAudience;
                    const checked = audiences.includes(value);
                    const { icon: Icon, hint } = AUDIENCE_CARDS[value];
                    return (
                      <label
                        key={value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                          checked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <span
                          className={`size-9 shrink-0 flex items-center justify-center rounded-md transition-colors ${
                            checked
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {option.label}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {hint}
                          </span>
                        </span>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) => setAudience(value, next)}
                        />
                      </label>
                    );
                  })}
                </div>
                {errors.targetAudience ? (
                  <FieldError>{errors.targetAudience}</FieldError>
                ) : (
                  audiences.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Pick an audience to aim this at a shop type and choose a
                      sponsoring shop.
                    </p>
                  )
                )}

                {/* Sponsor — offered once there is an audience to pick from */}
                {audiences.length > 0 && (
                  <div className="mt-2 space-y-2 rounded-lg border border-border/70 bg-muted/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="promo-shop">
                        Shop Account{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      {!isFetchingShops && !isShopOptionsError && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {shopSelectOptions.length - 1} available
                        </span>
                      )}
                    </div>
                    <SearchSelect
                      // SearchSelect only reads `value` on mount, so a sponsor
                      // cleared by unticking its audience needs a remount to
                      // show. Keyed on the loaded list too, so the label
                      // appears once the options arrive.
                      key={`${formData.shopId}|${shopSelectOptions.length}`}
                      id="promo-shop"
                      fullWidth
                      className="w-full"
                      startIcon={<StoreIcon className="size-4" />}
                      options={shopSelectOptions}
                      value={formData.shopId}
                      placeholder={
                        isFetchingShops ? "Loading shops…" : "Select a shop"
                      }
                      searchPlaceholder="Search shops..."
                      disabled={isFetchingShops && shopOptions.length === 0}
                      onValueChange={(val) => set("shopId", val)}
                    />
                    {isShopOptionsError ? (
                      <FieldError>
                        Could not load shops. Reload the page to try again.
                      </FieldError>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {formData.shopId
                          ? "This promotion runs as sponsored by the selected shop."
                          : `Lists ${audiences
                              .map((a) => audienceLabel(a).toLowerCase())
                              .join(
                                " & ",
                              )} only. Leave empty for a platform-wide promotion.`}
                      </p>
                    )}
                  </div>
                )}
              </Field>

              {/* Tags */}
              <Field>
                <FieldLabel htmlFor="promo-tags">
                  Tags
                  <span className="text-xs font-normal text-muted-foreground">
                    press Enter or Add
                  </span>
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="promo-tags"
                    name="tags"
                    placeholder="e.g. ramadan, discount"
                    value={tagDraft}
                    onValueChange={setTagDraft}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        // Enter would submit the form — the key adds a tag.
                        e.preventDefault();
                        addTag();
                      } else if (e.key === "Backspace" && !tagDraft) {
                        setFormData((prev) => ({
                          ...prev,
                          tags: prev.tags.slice(0, -1),
                        }));
                      }
                    }}
                    onBlur={addTag}
                    className="bg-transparent flex-1"
                  />
                  {/* Never disabled — `addTag` already ignores a blank draft,
                      so an empty click is a no-op rather than a dead control.
                      Blocking the mousedown keeps the input from blurring,
                      which would otherwise commit the tag before the click
                      lands and leave this button acting on an emptied draft. */}
                  <Button
                    type="button"
                    startIcon={<PlusIcon className="size-4" />}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={addTag}
                    aria-label="Add tag"
                    className="h-10 shrink-0 px-4"
                  >
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove ${tag}`}
                          className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          </div>
        </div>

        {/* Right — scheduling and media */}
        <div className="space-y-5">
          <div className="bg-card rounded-lg border border-border/50">
            <h2 className="bg-border/20 p-3 font-semibold text-foreground rounded-t-lg">
              Schedule &amp; Visibility
            </h2>
            <div className="p-3 sm:p-5 space-y-4">
              <Field>
                <FieldLabel htmlFor="promo-start">
                  Start Date
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <HugeCalender
                  id="promo-start"
                  mode="single"
                  placeholder="Select start date"
                  align="right"
                  value={{
                    start: formData.startDate
                      ? new Date(formData.startDate)
                      : null,
                    end: formData.startDate
                      ? new Date(formData.startDate)
                      : null,
                  }}
                  onChange={(v) => {
                    set("startDate", fromPickedDate(v.start));
                    if (errors.startDate)
                      setErrors((prev) => ({ ...prev, startDate: "" }));
                  }}
                  fullWidth
                  inputClass="w-full h-10 bg-transparent"
                />
                {errors.startDate && (
                  <FieldError>{errors.startDate}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="promo-end">
                  End Date
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <HugeCalender
                  id="promo-end"
                  mode="single"
                  placeholder="Select end date"
                  align="right"
                  // The end can never precede the start, so the picker refuses
                  // those days outright instead of letting validate() scold
                  // the author after the fact.
                  minDate={minEndDate}
                  value={{
                    start: formData.endDate ? new Date(formData.endDate) : null,
                    end: formData.endDate ? new Date(formData.endDate) : null,
                  }}
                  onChange={(v) => {
                    set("endDate", fromPickedDate(v.start));
                    if (errors.endDate)
                      setErrors((prev) => ({ ...prev, endDate: "" }));
                  }}
                  fullWidth
                  inputClass="w-full h-10 bg-transparent"
                />
                {errors.endDate && <FieldError>{errors.endDate}</FieldError>}
              </Field>

              <Field>
                <FieldLabel id="promo-status-label" htmlFor="promo-status">
                  Status
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Select
                  id="promo-status"
                  value={formData.status}
                  onValueChange={(val) => set("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select status"
                      options={PROMOTION_STATUS_OPTIONS}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItems options={PROMOTION_STATUS_OPTIONS} />
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Publishing approves it; the dates decide when it runs.
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="promo-priority">Priority</FieldLabel>
                <Input
                  id="promo-priority"
                  name="priority"
                  type="number"
                  min={0}
                  value={formData.priority}
                  onValueChange={(val) => {
                    set("priority", val);
                    if (errors.priority)
                      setErrors((prev) => ({ ...prev, priority: "" }));
                  }}
                  aria-invalid={errors.priority ? true : undefined}
                  className="bg-transparent"
                />
                {errors.priority ? (
                  <FieldError>{errors.priority}</FieldError>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Higher wins when promotions compete for the same slot.
                  </p>
                )}
              </Field>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-card rounded-lg border border-border/50">
            <h2 className="bg-border/20 p-3 font-semibold text-foreground rounded-t-lg">
              Banner Image
              <span className="text-destructive" aria-hidden="true">
                {" "}
                *
              </span>
            </h2>
            <div className="p-3 sm:p-5">
              <div
                id="promo-banner"
                role="button"
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors min-h-40 overflow-hidden ${
                  errors.bannerImage
                    ? "border-destructive"
                    : "border-border hover:border-primary"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
                {bannerPreview ? (
                  <div className="absolute inset-0">
                    <Image
                      src={bannerPreview}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                      // Blob previews and S3 URLs both bypass the optimiser.
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBannerFile(null);
                        setStoredBannerUrl("");
                      }}
                      aria-label="Remove image"
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <CloudUploadIcon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary">Click to upload</span>{" "}
                      banner
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      JPG, PNG or WebP — max 10MB
                    </p>
                  </div>
                )}
              </div>
              {errors.bannerImage && (
                <FieldError className="mt-2">{errors.bannerImage}</FieldError>
              )}
              {isEdit && bannerPreview && !bannerFile && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Keeping the current image. Pick a new file to replace it.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
