"use client";

import { useState, useRef } from "react";
import {
  Promotion,
  Wholesaler,
  AdvertisementType,
  TargetAudience,
  PromotionStatus,
} from "../_types/promotion.types";
import { Input } from "@/components/ui";
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
import { Select } from "@/components/ui/select/Select";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { HugeCalender } from "@/components/ui/calender/HugeCalender";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-darkBg p-3 sm:p-5 rounded-xl border border-border/50 dark:border-darkBorder">
        <div className="space-y-4">
          <Input
            label="Promotion Title"
            requiredSign
            placeholder="e.g. Summer Super Sale"
            value={formData.title}
            onValueChange={(val) => {
              setFormData((p) => ({ ...p, title: val }));
              if (errors.title) setErrors((p) => ({ ...p, title: "" }));
            }}
            error={errors.title}
            fullWidth
            className="dark:border-darkBorder dark:focus:border-darkBorder"
          />

          <Select
            label="Promotion Type"
            requiredSign
            options={adTypeOptions}
            value={formData.adType}
            onValueChange={(val) => {
              setFormData((p) => ({
                ...p,
                adType: val as AdvertisementType,
              }));
              if (errors.mediaUrl) setErrors((p) => ({ ...p, mediaUrl: "" }));
            }}
            className=" w-full dark:bg-darkBg dark:border-darkBorder"
          />

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
            className={`w-full dark:bg-darkBg ${errors.wholesalerId ? "border-red-500" : "dark:border-darkBorder"}`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, status: val as PromotionStatus }))
              }
              className="w-full dark:bg-darkBg dark:border-darkBorder"
            />
            <Select
              label="Target Audience"
              options={audienceOptions}
              value={formData.targetAudience}
              onValueChange={(val) =>
                setFormData((p) => ({
                  ...p,
                  targetAudience: val as TargetAudience,
                }))
              }
              className="w-full dark:bg-darkBg dark:border-darkBorder"
            />
          </div>

          <div className="pt-2">
            <label className="text-sm font-medium text-[#344054] dark:text-gray-100 flex items-center mb-1.5">
              {getMediaTypeIcon()}
              {formData.adType.toUpperCase()} Media Link{" "}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              placeholder={`Enter ${formData.adType} URL`}
              value={formData.mediaUrl}
              onValueChange={(val) => {
                setFormData((p) => ({ ...p, mediaUrl: val }));
                if (errors.mediaUrl) setErrors((p) => ({ ...p, mediaUrl: "" }));
              }}
              error={errors.mediaUrl}
              fullWidth
              className="dark:border-darkBorder dark:focus:border-[#0284c7]"
            />
            <p className="mt-1 text-[11px] text-gray-500 italic">
              Example:{" "}
              {formData.adType === "video"
                ? "https://youtube.com/..."
                : formData.adType === "audio"
                  ? "https://storage.com/audio.mp3"
                  : "https://docs.com/promo.pdf"}
            </p>
          </div>
        </div>

        {/* Banner Upload & Schedule */}
        <div className="space-y-4">
          <div className="space-y-1.5 mb-5">
            <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block">
              Promotion Banner
            </label>
            <div
              role="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-[#EAECF0] dark:border-darkBorder rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#0284c7]/50 hover:bg-gray-50/50 dark:hover:bg-darkPrimary/50 h-[220px] overflow-hidden"
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
                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full p-1.5 shadow transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-2 border border-[#EAECF0] dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkPrimary/90 transition-transform group-hover:scale-110">
                    <CloudUploadIcon className="h-6 w-6 text-[#667085] dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#475467] dark:text-gray-300 font-medium">
                      <span className="text-[#0284c7]">Click to upload</span> or
                      drag
                    </p>
                    <p className="text-xs text-[#667085]">
                      Recommended 1200x630px
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <HugeCalender
            label="Start date - End date"
            placeholder="Select Start date and End date"
            inputClass="w-full h-[42px]"
          />

          <div className="mt-5">
            <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block mb-1.5">
              Priority Level
            </label>
            <div className="flex relative items-center gap-1 border border-border dark:border-darkBorder rounded-lg p-1.5 bg-gray-50/50 dark:bg-darkPrimary/50 overflow-hidden">
              <div
                className="absolute bg-[#0284c7] ani3 rounded-md z-0"
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
                      ? "text-white"
                      : "text-gray-500 hover:bg-gray-200/50 dark:hover:bg-white/10"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              1 = Highest Priority, 5 = Lowest Priority
            </p>
          </div>
        </div>
      </div>

      {/* Description Section */}

      <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block mb-2">
        Short Description & Promotional Message{" "}
        <span className="text-red-500">*</span>
      </label>
      <textarea
        rows={9}
        value={formData.shortDescription}
        onChange={(e) => {
          setFormData((p) => ({ ...p, shortDescription: e.target.value }));
          if (errors.shortDescription)
            setErrors((p) => ({ ...p, shortDescription: "" }));
        }}
        className={`w-full rounded-xl border ${errors.shortDescription ? "border-red-500" : "border-border dark:border-darkBorder"} p-4 text-sm bg-white dark:bg-darkBg outline-none focus:outline-none focus:border-[#0284c7]/20 transition-shadow placeholder:text-gray-400`}
        placeholder="Summarize the promotion for the audience..."
      />
      {errors.shortDescription && (
        <p className="text-xs text-red-500 mt-1">{errors.shortDescription}</p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className=" border-border dark:border-darkBorder "
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
