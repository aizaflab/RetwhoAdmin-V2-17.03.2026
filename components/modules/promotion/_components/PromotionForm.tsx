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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-darkBg p-5 sm:p-6 rounded-2xl border border-border/50 dark:border-darkBorder shadow-sm">
        <div className="space-y-4">
          <Input
            label="Promotion Title *"
            placeholder="e.g. Summer Super Sale"
            value={formData.title}
            onValueChange={(val) => {
              setFormData((p) => ({ ...p, title: val }));
              if (errors.title) setErrors((p) => ({ ...p, title: "" }));
            }}
            error={errors.title}
            fullWidth
            className="dark:border-darkBorder dark:focus:border-[#0284c7]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Ad Type *"
              options={adTypeOptions}
              value={formData.adType}
              onValueChange={(val) => {
                setFormData((p) => ({
                  ...p,
                  adType: val as AdvertisementType,
                }));
                if (errors.mediaUrl) setErrors((p) => ({ ...p, mediaUrl: "" }));
              }}
              className="h-11 w-full dark:bg-darkBg dark:border-darkBorder"
            />
            <Select
              label="Wholesaler *"
              options={wholesalerOptions}
              value={formData.wholesalerId}
              onValueChange={(val) => {
                setFormData((p) => ({ ...p, wholesalerId: val }));
                if (errors.wholesalerId)
                  setErrors((p) => ({ ...p, wholesalerId: "" }));
              }}
              error={errors.wholesalerId}
              className={`h-11 w-full dark:bg-darkBg ${errors.wholesalerId ? "border-red-500" : "dark:border-darkBorder"}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, status: val as PromotionStatus }))
              }
              className="h-11 w-full dark:bg-darkBg dark:border-darkBorder"
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
              className="h-11 w-full dark:bg-darkBg dark:border-darkBorder"
            />
          </div>

          <div className="pt-2">
            <label className="text-sm font-medium text-[#344054] dark:text-gray-100 flex items-center mb-1.5">
              {getMediaTypeIcon()}
              {formData.adType.toUpperCase()} Media Link *
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
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block">
              Promotion Banner
            </label>
            <div
              role="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-[#EAECF0] dark:border-darkBorder rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#0284c7] hover:bg-gray-50/50 dark:hover:bg-white/5 h-[165px] overflow-hidden"
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
                  <div className="p-2 border border-[#EAECF0] dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-white/5 transition-transform group-hover:scale-110">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, startDate: e.target.value }))
                }
                className="w-full h-11 px-3 rounded-lg border border-border dark:border-darkBorder bg-white dark:bg-darkBg text-sm focus:ring-2 focus:ring-[#0284c7]/20 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, endDate: e.target.value }))
                }
                className="w-full h-11 px-3 rounded-lg border border-border dark:border-darkBorder bg-white dark:bg-darkBg text-sm focus:ring-2 focus:ring-[#0284c7]/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block mb-1.5">
              Priority Level
            </label>
            <div className="flex items-center gap-4 border border-border dark:border-darkBorder rounded-lg p-1.5 bg-gray-50/50 dark:bg-white/5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, priority: lvl }))}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                    formData.priority === lvl
                      ? "bg-[#0284c7] text-white shadow-sm"
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
      <div className="bg-white dark:bg-darkBg p-6 rounded-2xl border border-border/50 dark:border-darkBorder shadow-sm">
        <label className="text-sm font-medium text-[#344054] dark:text-gray-100 block mb-2">
          Short Description & Promotional Message *
        </label>
        <textarea
          rows={4}
          value={formData.shortDescription}
          onChange={(e) => {
            setFormData((p) => ({ ...p, shortDescription: e.target.value }));
            if (errors.shortDescription)
              setErrors((p) => ({ ...p, shortDescription: "" }));
          }}
          className={`w-full rounded-xl border ${errors.shortDescription ? "border-red-500" : "border-border dark:border-darkBorder"} p-4 text-sm bg-white dark:bg-darkBg outline-none focus:ring-2 focus:ring-[#0284c7]/20 transition-shadow placeholder:text-gray-400`}
          placeholder="Summarize the promotion for the audience..."
        />
        {errors.shortDescription && (
          <p className="text-xs text-red-500 mt-1">{errors.shortDescription}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="px-6 h-11 border-border dark:border-darkBorder text-gray-500 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-10 h-11 bg-[#0284c7] hover:bg-[#0284c7]/90 text-white rounded-xl shadow-lg shadow-[#0284c7]/20 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {initialData ? "Update Promotion" : "Create Promotion"}
        </Button>
      </div>
    </form>
  );
}
