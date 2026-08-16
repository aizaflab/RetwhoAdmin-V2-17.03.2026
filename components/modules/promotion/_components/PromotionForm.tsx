"use client";

import { useState, useRef } from "react";
import {
  Promotion,
  Wholesaler,
  AdvertisementType,
  TargetAudience,
  PromotionStatus,
} from "../_types/promotion.types";
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import {
  CloudUploadIcon,
  Plus,
  X,
  Video,
  Headphones,
  FileText,
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { HugeCalender } from "@/components/ui/calendar/HugeCalender";
import { SearchSelect } from "@/components/ui/select/SearchSelect";

interface PromotionFormProps {
  initialData?: Promotion | null;
  wholesalers: Wholesaler[];
  onSave: (data: Partial<Promotion>) => void;
}

export default function PromotionForm({
  initialData,
  wholesalers,
  onSave,
}: PromotionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    status: initialData?.status || "active",
    adType: initialData?.adType || "video",
    wholesalerId: initialData?.wholesalerId || "",
    shortDescription: initialData?.shortDescription || "",
    mediaUrl: initialData?.mediaUrl || "",
    bannerImage: initialData?.bannerImage || "",
    startDate: initialData?.startDate
      ? initialData.startDate.split("T")[0]
      : "",
    endDate: initialData?.endDate ? initialData.endDate.split("T")[0] : "",
    targetAudience: initialData?.targetAudience || "all",
    priority: initialData?.priority || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setFormData((prev) => ({ ...prev, bannerImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrs: Record<string, string> = {};
    if (!formData.title.trim()) newErrs.title = "Promotion title is required";
    if (!formData.wholesalerId)
      newErrs.wholesalerId = "Wholesaler selection is required";
    if (!formData.mediaUrl.trim())
      newErrs.mediaUrl = `${formData.adType.toUpperCase()} link is required`;
    if (!formData.shortDescription.trim())
      newErrs.shortDescription = "Description is required";

    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedWholesaler = wholesalers.find(
      (w) => w.id === formData.wholesalerId,
    );

    onSave({
      id: initialData?.id || `prm_${Date.now()}`,
      ...formData,
      wholesalerName: selectedWholesaler?.name || "Unknown",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Partial<Promotion>);
  };

  const adTypeOptions = [
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "pdf", label: "PDF" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "scheduled", label: "Scheduled" },
    { value: "expired", label: "Expired" },
  ];

  const audienceOptions = [
    { value: "all", label: "Everyone" },
    { value: "wholesalers", label: "Wholesalers Only" },
    { value: "retailers", label: "Retailers Only" },
    { value: "customers", label: "Customers Only" },
  ];

  const wholesalerOptions = wholesalers.map((w) => ({
    value: w.id,
    label: w.name,
  }));

  const getMediaTypeIcon = () => {
    switch (formData.adType) {
      case "video":
        return <Video className="h-4 w-4 mr-2" />;
      case "audio":
        return <Headphones className="h-4 w-4 mr-2" />;
      case "pdf":
        return <FileText className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-card p-3 sm:p-5 rounded-xl border border-border/50">
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="promo-title">
              Promotion Title
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Input
              id="promo-title"
              name="title"
              placeholder="e.g. Summer Super Sale"
              value={formData.title}
              onValueChange={(val) => {
                setFormData((p) => ({ ...p, title: val }));
                if (errors.title) setErrors((p) => ({ ...p, title: "" }));
              }}
              aria-invalid={errors.title ? true : undefined}
              className="bg-transparent"
            />
            {errors.title && <FieldError>{errors.title}</FieldError>}
          </Field>

          <Field>
            <FieldLabel id="promo-adtype-label" htmlFor="promo-adtype">
              Promotion Type
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Select
              id="promo-adtype"
              value={formData.adType}
              onValueChange={(val) => {
                setFormData((p) => ({
                  ...p,
                  adType: val as AdvertisementType,
                }));
                if (errors.mediaUrl) setErrors((p) => ({ ...p, mediaUrl: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Select promotion type"
                  options={adTypeOptions}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={adTypeOptions} />
              </SelectContent>
            </Select>
          </Field>

          <SearchSelect
            label="Wholesaler"
            requiredSign
            options={wholesalerOptions}
            value={formData.wholesalerId}
            onValueChange={(val) => {
              setFormData((p) => ({ ...p, wholesalerId: val }));
              if (errors.wholesalerId)
                setErrors((p) => ({ ...p, wholesalerId: "" }));
            }}
            error={errors.wholesalerId}
            className="w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel id="promo-status-label" htmlFor="promo-status">
                Status
              </FieldLabel>
              <Select
                id="promo-status"
                value={formData.status}
                onValueChange={(val) =>
                  setFormData((p) => ({ ...p, status: val as PromotionStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Select status"
                    options={statusOptions}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={statusOptions} />
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel id="promo-audience-label" htmlFor="promo-audience">
                Target Audience
              </FieldLabel>
              <Select
                id="promo-audience"
                value={formData.targetAudience}
                onValueChange={(val) =>
                  setFormData((p) => ({
                    ...p,
                    targetAudience: val as TargetAudience,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Select audience"
                    options={audienceOptions}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={audienceOptions} />
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field className="pt-2">
            <FieldLabel htmlFor="promo-media-url">
              {getMediaTypeIcon()}
              {formData.adType.toUpperCase()} Media Link
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Input
              id="promo-media-url"
              name="mediaUrl"
              type="url"
              placeholder={`Enter ${formData.adType} URL`}
              value={formData.mediaUrl}
              onValueChange={(val) => {
                setFormData((p) => ({ ...p, mediaUrl: val }));
                if (errors.mediaUrl) setErrors((p) => ({ ...p, mediaUrl: "" }));
              }}
              aria-invalid={errors.mediaUrl ? true : undefined}
              className="bg-transparent"
            />
            {errors.mediaUrl && <FieldError>{errors.mediaUrl}</FieldError>}
            <p className="mt-1 text-[11px] text-muted-foreground italic">
              Example:{" "}
              {formData.adType === "video"
                ? "https://youtube.com/..."
                : formData.adType === "audio"
                  ? "https://storage.com/audio.mp3"
                  : "https://docs.com/promo.pdf"}
            </p>
          </Field>
        </div>

        {/* Banner Upload & Schedule */}
        <div className="space-y-4">
          <Field className="mb-5">
            <FieldLabel htmlFor="promo-banner">Promotion Banner</FieldLabel>
            <div
              id="promo-banner"
              role="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50 h-55 overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.bannerImage ? (
                <div className="absolute inset-0 block">
                  <Image
                    src={formData.bannerImage}
                    className="w-full h-full object-cover"
                    alt="Banner Preview"
                    fill
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-medium px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">
                      Change Image
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((p) => ({ ...p, bannerImage: "" }));
                    }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-destructive text-white rounded-full p-1.5 shadow transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-2 border border-border rounded-xl bg-muted/50 transition-transform group-hover:scale-110">
                    <CloudUploadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      <span className="text-primary">Click to upload</span> or
                      drag
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended 1200x630px
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="promo-schedule">
              Start date - End date
            </FieldLabel>
            <HugeCalender
              id="promo-schedule"
              placeholder="Select Start date and End date"
              inputClass="w-full h-10 bg-transparent"
            />
          </Field>

          <div className="mt-5">
            <FieldLabel className="mb-1.5">Priority Level</FieldLabel>
            <div className="flex relative items-center gap-1 border border-border rounded-lg p-1.5 bg-muted/50 overflow-hidden">
              <div
                className="absolute bg-primary ani3 rounded-md z-0"
                style={{
                  width: "calc((100% - 48px) / 10)",
                  height: "calc(100% - 12px)",
                  left: `calc(6px + (${formData.priority - 1} * (100% - 8px) / 10))`,
                }}
              ></div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, priority: lvl }))}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all relative z-10 cursor-pointer ${
                    formData.priority === lvl
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              1 = Highest Priority, 5 = Lowest Priority
            </p>
          </div>
        </div>
      </div>

      {/* Description Section */}

      <Field>
        <FieldLabel htmlFor="promo-description">
          Short Description &amp; Promotional Message
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </FieldLabel>
        <Textarea
          id="promo-description"
          name="shortDescription"
          rows={9}
          value={formData.shortDescription}
          onChange={(e) => {
            setFormData((p) => ({ ...p, shortDescription: e.target.value }));
            if (errors.shortDescription)
              setErrors((p) => ({ ...p, shortDescription: "" }));
          }}
          invalid={!!errors.shortDescription}
          placeholder="Summarize the promotion for the audience..."
          className="rounded-xl bg-transparent p-4"
        />
        {errors.shortDescription && (
          <FieldError>{errors.shortDescription}</FieldError>
        )}
      </Field>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-border"
        >
          Cancel
        </Button>
        <Button type="submit" className="px-3">
          <Plus className="h-4 w-4" />
          {initialData ? "Update Promotion" : "Create Promotion"}
        </Button>
      </div>
    </form>
  );
}
