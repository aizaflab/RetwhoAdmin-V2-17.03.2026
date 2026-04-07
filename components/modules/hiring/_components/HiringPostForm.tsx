"use client";

import { useState, useRef } from "react";
import {
  HiringPost,
  HiringCategory,
  HiringStatus,
  JobType,
  SalaryType,
} from "../_types/hiring.types";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { useRouter } from "next/navigation";
import TextEditor from "@/components/ui/editor/TextEditor";
import {
  CloudUploadIcon,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  X,
  Plus,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { MoveLeft } from "lucide-react";
import { HugeCalender } from "@/components/ui/calender/HugeCalender";

interface HiringPostFormProps {
  initialData?: HiringPost | null;
  categories: HiringCategory[];
  onSave: (data: Partial<HiringPost>) => void;
}

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "remote", label: "Remote" },
];

const SALARY_TYPE_OPTIONS: { value: SalaryType; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "hourly", label: "Hourly" },
  { value: "yearly", label: "Yearly" },
  { value: "fixed", label: "Fixed (One-time)" },
];

const STATUS_OPTIONS: { value: HiringStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Closed" },
];

const CURRENCY_OPTIONS = [
  { value: "BDT", label: "BDT (৳)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
];

export default function HiringPostForm({
  initialData,
  categories,
  onSave,
}: HiringPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [skillInput, setSkillInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    companyName: initialData?.companyName ?? "",
    companyLogo: initialData?.companyLogo ?? "",
    bannerImage: initialData?.bannerImage ?? "",
    categoryId: initialData?.categoryId ?? "",
    address: initialData?.address ?? "",
    city: initialData?.city ?? "",
    country: initialData?.country ?? "Bangladesh",
    jobType: (initialData?.jobType ?? "full-time") as JobType,
    salaryMin: String(initialData?.salaryMin ?? ""),
    salaryMax: String(initialData?.salaryMax ?? ""),
    salaryType: (initialData?.salaryType ?? "monthly") as SalaryType,
    currency: initialData?.currency ?? "BDT",
    description: initialData?.description ?? "",
    requirements: initialData?.requirements ?? ([] as string[]),
    benefits: initialData?.benefits ?? ([] as string[]),
    skills: initialData?.skills ?? ([] as string[]),
    experience: initialData?.experience ?? "",
    education: initialData?.education ?? "",
    openings: String(initialData?.openings ?? "1"),
    deadline: initialData?.deadline?.slice(0, 10) ?? "",
    status: (initialData?.status ?? "draft") as HiringStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string | string[]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "bannerImage" | "companyLogo",
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") set(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      set("skills", [...formData.skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) =>
    set(
      "skills",
      formData.skills.filter((x) => x !== s),
    );

  const addRequirement = () => {
    const trimmed = reqInput.trim();
    if (trimmed && !formData.requirements.includes(trimmed)) {
      set("requirements", [...formData.requirements, trimmed]);
      setReqInput("");
    }
  };

  const removeRequirement = (req: string) =>
    set(
      "requirements",
      formData.requirements.filter((x) => x !== req),
    );

  const addBenefit = () => {
    const trimmed = benefitInput.trim();
    if (trimmed && !formData.benefits.includes(trimmed)) {
      set("benefits", [...formData.benefits, trimmed]);
      setBenefitInput("");
    }
  };

  const removeBenefit = (ben: string) =>
    set(
      "benefits",
      formData.benefits.filter((x) => x !== ben),
    );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "Title is required";
    if (!formData.companyName.trim())
      errs.companyName = "Company name is required";
    if (!formData.categoryId) errs.categoryId = "Category is required";
    if (!formData.address.trim()) errs.address = "Address is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.salaryMin) errs.salaryMin = "Minimum salary is required";
    if (!formData.description.trim())
      errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: initialData?.id ?? `hire_${Date.now()}`,
      ...formData,
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      openings: Number(formData.openings),
      deadline: formData.deadline
        ? new Date(formData.deadline).toISOString()
        : undefined,
      views: initialData?.views ?? 0,
      applicationCount: initialData?.applicationCount ?? 0,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Partial<HiringPost>);
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.type})`,
  }));

  const sectionClass =
    "bg-white dark:bg-darkBg rounded-lg border border-border/50 dark:border-darkBorder/80";
  const sectionTitle =
    "bg-border/20 dark:bg-darkBorder/20 p-3 font-semibold text-black dark:text-white flex items-center gap-2 rounded-t-lg";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Header Actions ── */}
      <div className="flex items-center justify-between gap-5 mb-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="size-9 center rounded-lg bg-white dark:bg-darkPrimary border border-border/50 dark:border-darkBorder/50 hover:bg-gray-50 dark:hover:bg-darkBorder/40 cursor-pointer shrink-0"
        >
          <MoveLeft className="w-5 h-5 text-black dark:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="sm:text-[22px] text-lg font-medium text-black dark:text-white">
            {initialData ? "Edit Hiring Post" : "Add New Hiring Post"}
          </h1>
          <p className="text-xs text-text5 mt-0.5 hidden sm:block">
            Fill in all details carefully. Fields marked * are required.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-10 px-5 text-gray-500"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 px-6 bg-primary hover:bg-primary/90"
          >
            {initialData ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ══════════ LEFT / MAIN COLUMN ══════════ */}
        <div className="xl:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <Building2 className="w-4 h-4 text-primary" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 sm:p-5">
              <div className="sm:col-span-2">
                <Input
                  label="Job / Service Title *"
                  placeholder="e.g. Senior Full-Stack Developer"
                  value={formData.title}
                  onValueChange={(v) => {
                    set("title", v);
                    if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                  }}
                  error={errors.title}
                  fullWidth
                  className="dark:border-darkBorder dark:focus:border-darkLight/50"
                />
              </div>
              <Input
                label="Company / Organization Name *"
                placeholder="e.g. TechVentures Ltd."
                value={formData.companyName}
                onValueChange={(v) => {
                  set("companyName", v);
                  if (errors.companyName)
                    setErrors((p) => ({ ...p, companyName: "" }));
                }}
                error={errors.companyName}
                fullWidth
                className="dark:border-darkBorder"
              />

              <div>
                <Select
                  label="Category *"
                  options={categoryOptions}
                  value={formData.categoryId}
                  onValueChange={(v) => {
                    set("categoryId", v);
                    if (errors.categoryId)
                      setErrors((p) => ({ ...p, categoryId: "" }));
                  }}
                  error={errors.categoryId}
                  className="w-full"
                  fieldClass="h-[42px]!"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <MapPin className="w-4 h-4 text-primary" />
              Location Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 sm:p-5">
              <div className="sm:col-span-3">
                <Input
                  label="Address *"
                  placeholder="e.g. 123 Tech Park, Gulshan-2"
                  value={formData.address}
                  onValueChange={(v) => {
                    set("address", v);
                    if (errors.address)
                      setErrors((p) => ({ ...p, address: "" }));
                  }}
                  error={errors.address}
                  fullWidth
                  className="dark:border-darkBorder"
                />
              </div>
              <Input
                label="City *"
                placeholder="e.g. Dhaka"
                value={formData.city}
                onValueChange={(v) => {
                  set("city", v);
                  if (errors.city) setErrors((p) => ({ ...p, city: "" }));
                }}
                error={errors.city}
                fullWidth
                className="dark:border-darkBorder"
              />
              <Input
                label="Country"
                placeholder="e.g. Bangladesh"
                value={formData.country}
                onValueChange={(v) => set("country", v)}
                fullWidth
                className="dark:border-darkBorder"
              />
              <div>
                <Select
                  label="Job Type"
                  options={JOB_TYPE_OPTIONS}
                  value={formData.jobType}
                  onValueChange={(v) => set("jobType", v)}
                  className="w-full"
                  fieldClass="h-[42px]!"
                />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <DollarSign className="w-4 h-4 text-primary" />
              Compensation & Salary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-3 sm:p-5">
              <div className="col-span-2 sm:col-span-1">
                <Select
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                  value={formData.currency}
                  onValueChange={(v) => set("currency", v)}
                  className="w-full"
                  fieldClass="h-[42px]!"
                />
              </div>
              <Input
                label="Minimum Salary *"
                type="number"
                placeholder="e.g. 50000"
                value={formData.salaryMin}
                onValueChange={(v) => {
                  set("salaryMin", v);
                  if (errors.salaryMin)
                    setErrors((p) => ({ ...p, salaryMin: "" }));
                }}
                error={errors.salaryMin}
                fullWidth
                className="dark:border-darkBorder"
              />
              <Input
                label="Maximum Salary"
                type="number"
                placeholder="e.g. 80000"
                value={formData.salaryMax}
                onValueChange={(v) => set("salaryMax", v)}
                fullWidth
                className="dark:border-darkBorder"
              />
              <div>
                <Select
                  label="Salary Type"
                  options={SALARY_TYPE_OPTIONS}
                  value={formData.salaryType}
                  onValueChange={(v) => set("salaryType", v)}
                  className="w-full"
                  fieldClass="h-[42px]!"
                />
              </div>
            </div>
          </div>

          {/* Requirements & Experience */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <Clock className="w-4 h-4 text-primary" />
              Experience & Education
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 sm:p-5">
              <Input
                label="Experience Required"
                placeholder="e.g. 3-5 years"
                value={formData.experience}
                onValueChange={(v) => set("experience", v)}
                fullWidth
                className="dark:border-darkBorder"
              />
              <Input
                label="Education Level"
                placeholder="e.g. Bachelor's in CSE"
                value={formData.education}
                onValueChange={(v) => set("education", v)}
                fullWidth
                className="dark:border-darkBorder"
              />
            </div>

            {/* Skills / Tags */}
            <div className="p-3 sm:p-5 pt-0 sm:pt-0">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                Required Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 h-10 px-3 text-sm rounded-md border border-border dark:border-darkBorder bg-white dark:bg-darkPrimary text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-primary transition-colors"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  variant="outline"
                  className="h-10 px-3 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {formData.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary dark:text-blue-300 border border-primary/20"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`${sectionClass} p-3 sm:p-5`}>
            <label className="text-sm font-semibold text-black dark:text-white block mb-2.5">
              Requirements
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
                placeholder="Type a requirement and press Enter..."
                className="flex-1 h-10 px-3 text-sm rounded-md border border-border dark:border-darkBorder bg-white dark:bg-darkPrimary text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-primary transition-colors"
              />
              <Button
                type="button"
                onClick={addRequirement}
                variant="outline"
                className="h-10 px-3 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.requirements.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {formData.requirements.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 dark:bg-darkBorder/40 border border-border/50 dark:border-darkBorder/50 rounded-md px-3 py-2 text-sm text-black dark:text-white"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(r)}
                      className="hover:bg-red-500 hover:text-white text-gray-500 rounded-md p-1 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`${sectionClass} p-3 sm:p-5`}>
            <label className="text-sm font-semibold text-black dark:text-white block mb-2.5">
              Benefits & Perks
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBenefit();
                  }
                }}
                placeholder="Type a benefit/perk and press Enter..."
                className="flex-1 h-10 px-3 text-sm rounded-md border border-border dark:border-darkBorder bg-white dark:bg-darkPrimary text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-primary transition-colors"
              />
              <Button
                type="button"
                onClick={addBenefit}
                variant="outline"
                className="h-10 px-3 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.benefits.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {formData.benefits.map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 dark:bg-darkBorder/40 border border-border/50 dark:border-darkBorder/50 rounded-md px-3 py-2 text-sm text-black dark:text-white"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(b)}
                      className="hover:bg-red-500 hover:text-white text-gray-500 rounded-md p-1 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rich-Text Sections */}
          <div className={`${sectionClass} p-3 sm:p-5`}>
            <label className="text-sm font-semibold text-black dark:text-white block mb-2.5">
              Job Description *
            </label>
            <TextEditor
              value={formData.description}
              onChange={(v) => {
                set("description", v);
                if (errors.description)
                  setErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="Describe the role, responsibilities, and what the candidate will do..."
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* ══════════ RIGHT / SIDEBAR COLUMN ══════════ */}
        <div className="space-y-5">
          {/* Publish Settings */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <Users className="w-4 h-4 text-primary" />
              Publish Settings
            </h2>

            <div className="sm:p-5 p-3 space-y-4">
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onValueChange={(v) => set("status", v)}
                className="w-full"
                fieldClass="h-[42px]!"
              />

              <Input
                label="Number of Openings"
                type="number"
                placeholder="e.g. 2"
                value={formData.openings}
                onValueChange={(v) => set("openings", v)}
                fullWidth
                className="dark:border-darkBorder"
              />

              {/* Application Deadline */}
              <div>
                <HugeCalender
                  label="Application Deadline"
                  value={{
                    start: formData.deadline
                      ? new Date(formData.deadline)
                      : null,
                    end: null,
                  }}
                  onChange={(v) =>
                    set(
                      "deadline",
                      v.start
                        ? new Date(
                            v.start.getTime() -
                              v.start.getTimezoneOffset() * 60000,
                          )
                            .toISOString()
                            .slice(0, 10)
                        : "",
                    )
                  }
                  fullWidth
                  inputClass="w-full h-11"
                  align="right"
                />
              </div>
            </div>
          </div>

          {/* Company Logo */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>Company Logo</h2>

            <div className=" p-3 sm:p-5">
              <div
                role="button"
                onClick={() => logoInputRef.current?.click()}
                className="relative border-2 border-dashed border-border dark:border-darkBorder rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-36 overflow-hidden"
              >
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "companyLogo")}
                />
                {formData.companyLogo ? (
                  <div className="absolute inset-2 rounded-lg overflow-hidden">
                    <Image
                      src={formData.companyLogo}
                      alt="Logo"
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        set("companyLogo", "");
                      }}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <CloudUploadIcon className="w-8 h-8 text-text5" />
                    <p className="text-xs text-text5">
                      <span className="text-primary">Click to upload</span> logo
                    </p>
                    <p className="text-[10px] text-text5">
                      PNG, JPG (square preferred)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Banner / Cover Image */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>Cover / Banner Image</h2>
            <div className=" p-3 sm:p-5">
              <div
                role="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-border dark:border-darkBorder rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-40 overflow-hidden"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "bannerImage")}
                />
                {formData.bannerImage ? (
                  <div className="absolute inset-0">
                    <Image
                      src={formData.bannerImage}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        set("bannerImage", "");
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <CloudUploadIcon className="w-8 h-8 text-text5" />
                    <p className="text-xs text-text5">
                      <span className="text-primary">Click to upload</span>{" "}
                      banner
                    </p>
                    <p className="text-[10px] text-text5">
                      1200 × 630px recommended
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
