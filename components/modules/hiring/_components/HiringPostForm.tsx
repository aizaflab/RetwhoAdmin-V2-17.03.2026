"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  HIRING_STATUS_OPTIONS,
  HIRING_TYPE_OPTIONS,
  SALARY_TYPE_OPTIONS,
} from "../_data/hiring-options";
import type {
  EmploymentType,
  HiringPost,
  HiringPostPayload,
  HiringStatus,
  HiringType,
  SalaryType,
} from "../_types/hiring.types";
import { Field, FieldError, FieldLabel, Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";
import { useRouter } from "next/navigation";
import {
  CloudUploadIcon,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  X,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { MoveLeft } from "lucide-react";
import TextEditor from "@/components/ui/editor/TextEditor";
import { HugeCalender } from "@/components/ui/calendar/HugeCalender";

interface HiringPostFormProps {
  /** Present in edit mode; omit to create a new posting. */
  initialData?: HiringPost | null;
  /** Assignable categories from `GET /hiring/categories/options`. */
  categoryOptions: SelectOption[];
  categoriesLoading?: boolean;
  /** Must reject on failure — the rejection is what surfaces the API's reason. */
  onSave: (
    payload: HiringPostPayload,
    files: { companyLogoFile: File | null; bannerImageFile: File | null },
  ) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

/** The API rejects anything larger, and the browser can check first. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: "BDT", label: "BDT (৳)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
];

export default function HiringPostForm({
  initialData,
  categoryOptions,
  categoriesLoading,
  onSave,
  saving = false,
}: HiringPostFormProps) {
  const isEdit = !!initialData;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [skillInput, setSkillInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  // Field names match the API body, so this state object is (almost) the
  // payload — `slug` is absent because the server derives it from the title
  // and its strict schema rejects the field outright.
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    companyName: initialData?.companyName ?? "",
    categoryId: initialData?.categoryId ?? "",
    address: initialData?.address ?? "",
    city: initialData?.city ?? "",
    country: initialData?.country ?? "Bangladesh",
    hiringType: (initialData?.hiringType ?? "job") as HiringType,
    employmentType: (initialData?.employmentType ??
      "full-time") as EmploymentType,
    salaryMin: String(initialData?.salaryMin ?? ""),
    salaryMax: String(initialData?.salaryMax ?? ""),
    salaryType: (initialData?.salaryType ?? "monthly") as SalaryType,
    currency: initialData?.currency ?? "USD",
    description: initialData?.description ?? "",
    requirements: initialData?.requirements ?? ([] as string[]),
    benefits: initialData?.benefits ?? ([] as string[]),
    skills: initialData?.skills ?? ([] as string[]),
    experience: initialData?.experience ?? "",
    education: initialData?.education ?? "",
    numberOfOpenings: String(initialData?.numberOfOpenings ?? "1"),
    applicationDeadline: initialData?.applicationDeadline?.slice(0, 10) ?? "",
    status: (initialData?.status ?? "draft") as HiringStatus,
  });

  // Newly picked files, or null when the stored images are being kept.
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  // The images already on the posting; cleared when the author removes one.
  const [storedLogoUrl, setStoredLogoUrl] = useState(
    initialData?.companyLogo?.url ?? "",
  );
  const [storedBannerUrl, setStoredBannerUrl] = useState(
    initialData?.bannerImage?.url ?? "",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string | string[]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Derived rather than stored, so picking a file does not need a second
  // render pass to show its preview.
  const logoObjectUrl = useMemo(
    () => (companyLogoFile ? URL.createObjectURL(companyLogoFile) : ""),
    [companyLogoFile],
  );
  const bannerObjectUrl = useMemo(
    () => (bannerImageFile ? URL.createObjectURL(bannerImageFile) : ""),
    [bannerImageFile],
  );

  // An object URL pins the file in memory until it is revoked.
  useEffect(() => {
    if (!logoObjectUrl) return;
    return () => URL.revokeObjectURL(logoObjectUrl);
  }, [logoObjectUrl]);

  useEffect(() => {
    if (!bannerObjectUrl) return;
    return () => URL.revokeObjectURL(bannerObjectUrl);
  }, [bannerObjectUrl]);

  // A freshly picked file always wins over whatever was stored.
  const logoPreview = logoObjectUrl || storedLogoUrl;
  const bannerPreview = bannerObjectUrl || storedBannerUrl;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "bannerImage" | "companyLogo",
  ) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file twice still fires a change event.
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Upload a JPG, PNG or WebP image",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, [field]: "Image must be under 10MB" }));
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "companyLogo") setCompanyLogoFile(file);
    else setBannerImageFile(file);
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

  // Mirrors the API's own rules, so a typo is caught before the round trip
  // rather than coming back as a 400.
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "Title is required";
    else if (formData.title.trim().length < 2)
      errs.title = "Title must be at least 2 characters";
    if (!formData.companyName.trim())
      errs.companyName = "Company name is required";
    if (!formData.categoryId) errs.categoryId = "Category is required";
    if (!formData.address.trim()) errs.address = "Address is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.country.trim()) errs.country = "Country is required";
    if (!formData.experience.trim()) errs.experience = "Experience is required";
    if (!formData.education.trim()) errs.education = "Education is required";

    const min = Number(formData.salaryMin);
    const max = Number(formData.salaryMax);
    if (formData.salaryMin === "" || Number.isNaN(min))
      errs.salaryMin = "Minimum salary is required";
    else if (min < 0) errs.salaryMin = "Salary cannot be negative";
    if (formData.salaryMax === "" || Number.isNaN(max))
      errs.salaryMax = "Maximum salary is required";
    else if (max < min)
      errs.salaryMax = "Maximum must be greater than or equal to the minimum";

    const openings = Number(formData.numberOfOpenings);
    if (!Number.isInteger(openings) || openings < 1)
      errs.numberOfOpenings = "At least one opening is required";

    if (!formData.applicationDeadline) {
      errs.applicationDeadline = "Application deadline is required";
    } else if (new Date(formData.applicationDeadline).getTime() <= Date.now()) {
      // The API refuses a deadline in the past outright.
      errs.applicationDeadline = "Deadline must be in the future";
    }

    if (!formData.description.trim())
      errs.description = "Description is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const title = formData.title.trim();

    const payload: HiringPostPayload = {
      title,
      companyName: formData.companyName.trim(),
      categoryId: formData.categoryId,
      hiringType: formData.hiringType,
      employmentType: formData.employmentType,
      address: formData.address.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      currency: formData.currency,
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      salaryType: formData.salaryType,
      status: formData.status,
      numberOfOpenings: Number(formData.numberOfOpenings),
      // The API coerces this with `z.coerce.date()`, so a full ISO string is
      // what it expects rather than the yyyy-mm-dd the date input holds.
      applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
      experience: formData.experience.trim(),
      education: formData.education.trim(),
      skills: formData.skills,
      requirements: formData.requirements,
      benefits: formData.benefits,
      description: formData.description,
    };

    try {
      await onSave(payload, { companyLogoFile, bannerImageFile });
      toast.success(
        isEdit
          ? `Posting "${title}" updated successfully`
          : `Posting "${title}" created successfully`,
      );
      router.push("/hiring/manage");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        isEdit
          ? "Could not update the posting. Please try again."
          : "Could not create the posting. Please try again.",
      );

      // 409 here is the duplicate-title conflict, which the author fixes in
      // the title field rather than in a dismissible toast.
      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, title: message }));
      }

      toast.error(message);
    }
  };

  const sectionClass = "bg-card rounded-lg border border-border/50";
  const sectionTitle =
    "bg-border/20 p-3 font-semibold text-foreground flex items-center gap-2 rounded-t-lg";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Header Actions ── */}
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
            {initialData ? "Edit Hiring Post" : "Add New Hiring Post"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            Fill in all details carefully. Fields marked * are required.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            className="h-10 px-6 bg-primary hover:bg-primary/90"
            loading={saving}
            loadingText="Saving..."
          >
            {isEdit ? "Update Post" : "Create Post"}
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
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="hiring-title">
                  Job / Service Title
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="hiring-title"
                  name="title"
                  placeholder="e.g. Senior Full-Stack Developer"
                  value={formData.title}
                  onValueChange={(v) => {
                    set("title", v);
                    if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                  }}
                  aria-invalid={errors.title ? true : undefined}
                  className="bg-transparent"
                />
                {errors.title && <FieldError>{errors.title}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="hiring-company">
                  Company / Organization Name
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="hiring-company"
                  name="companyName"
                  placeholder="e.g. TechVentures Ltd."
                  value={formData.companyName}
                  onValueChange={(v) => {
                    set("companyName", v);
                    if (errors.companyName)
                      setErrors((p) => ({ ...p, companyName: "" }));
                  }}
                  aria-invalid={errors.companyName ? true : undefined}
                  className="bg-transparent"
                />
                {errors.companyName && (
                  <FieldError>{errors.companyName}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel
                  id="hiring-category-label"
                  htmlFor="hiring-category"
                >
                  Category
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Select
                  id="hiring-category"
                  value={formData.categoryId}
                  onValueChange={(v) => {
                    set("categoryId", v);
                    if (errors.categoryId)
                      setErrors((p) => ({ ...p, categoryId: "" }));
                  }}
                >
                  <SelectTrigger error={!!errors.categoryId}>
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : "Select a category"
                      }
                      options={categoryOptions}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItems options={categoryOptions} />
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <FieldError>{errors.categoryId}</FieldError>
                )}
              </Field>
            </div>
          </div>

          {/* Location */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <MapPin className="w-4 h-4 text-primary" />
              Location Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 sm:p-5">
              <Field className="sm:col-span-3">
                <FieldLabel htmlFor="hiring-address">
                  Address
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="hiring-address"
                  name="address"
                  placeholder="e.g. 123 Tech Park, Gulshan-2"
                  value={formData.address}
                  onValueChange={(v) => {
                    set("address", v);
                    if (errors.address)
                      setErrors((p) => ({ ...p, address: "" }));
                  }}
                  aria-invalid={errors.address ? true : undefined}
                  className="bg-transparent"
                />
                {errors.address && <FieldError>{errors.address}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="hiring-city">
                  City
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="hiring-city"
                  name="city"
                  placeholder="e.g. Dhaka"
                  value={formData.city}
                  onValueChange={(v) => {
                    set("city", v);
                    if (errors.city) setErrors((p) => ({ ...p, city: "" }));
                  }}
                  aria-invalid={errors.city ? true : undefined}
                  className="bg-transparent"
                />
                {errors.city && <FieldError>{errors.city}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="hiring-country">Country</FieldLabel>
                <Input
                  id="hiring-country"
                  name="country"
                  placeholder="e.g. Bangladesh"
                  value={formData.country}
                  onValueChange={(v) => set("country", v)}
                  className="bg-transparent"
                />
              </Field>

              <Field>
                <FieldLabel
                  id="hiring-job-type-label"
                  htmlFor="hiring-job-type"
                >
                  Job Type
                </FieldLabel>
                <Select
                  id="hiring-job-type"
                  value={formData.employmentType}
                  onValueChange={(v) => set("employmentType", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select employment type"
                      options={EMPLOYMENT_TYPE_OPTIONS}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItems options={EMPLOYMENT_TYPE_OPTIONS} />
                  </SelectContent>
                </Select>
              </Field>

              {/* What is being advertised — distinct from the employment
                  arrangement above, and a separate field on the API. */}
              <Field>
                <FieldLabel id="hiring-type-label" htmlFor="hiring-type">
                  Listing Type
                </FieldLabel>
                <Select
                  id="hiring-type"
                  value={formData.hiringType}
                  onValueChange={(v) => set("hiringType", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select listing type"
                      options={HIRING_TYPE_OPTIONS}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItems options={HIRING_TYPE_OPTIONS} />
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* Compensation */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <DollarSign className="w-4 h-4 text-primary" />
              Compensation & Salary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-3 sm:p-5">
              <Field className="col-span-2 sm:col-span-1">
                <FieldLabel
                  id="hiring-currency-label"
                  htmlFor="hiring-currency"
                >
                  Currency
                </FieldLabel>
                <Select
                  id="hiring-currency"
                  value={formData.currency}
                  onValueChange={(v) => set("currency", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select currency"
                      options={CURRENCY_OPTIONS}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItems options={CURRENCY_OPTIONS} />
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="hiring-salary-min">
                  Minimum Salary
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="hiring-salary-min"
                  name="salaryMin"
                  type="number"
                  placeholder="e.g. 50000"
                  value={formData.salaryMin}
                  onValueChange={(v) => {
                    set("salaryMin", v);
                    if (errors.salaryMin)
                      setErrors((p) => ({ ...p, salaryMin: "" }));
                  }}
                  aria-invalid={errors.salaryMin ? true : undefined}
                  className="bg-transparent"
                />
                {errors.salaryMin && (
                  <FieldError>{errors.salaryMin}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="hiring-salary-max">
                  Maximum Salary
                </FieldLabel>
                <Input
                  id="hiring-salary-max"
                  name="salaryMax"
                  type="number"
                  placeholder="e.g. 80000"
                  value={formData.salaryMax}
                  onValueChange={(v) => set("salaryMax", v)}
                  className="bg-transparent"
                />
              </Field>

              <Field>
                <FieldLabel
                  id="hiring-salary-type-label"
                  htmlFor="hiring-salary-type"
                >
                  Salary Type
                </FieldLabel>
                <Select
                  id="hiring-salary-type"
                  value={formData.salaryType}
                  onValueChange={(v) => set("salaryType", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select salary type"
                      options={SALARY_TYPE_OPTIONS}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItems options={SALARY_TYPE_OPTIONS} />
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* Requirements & Experience */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>
              <Clock className="w-4 h-4 text-primary" />
              Experience & Education
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 sm:p-5">
              <Field>
                <FieldLabel htmlFor="hiring-experience">
                  Experience Required
                </FieldLabel>
                <Input
                  id="hiring-experience"
                  name="experience"
                  placeholder="e.g. 3-5 years"
                  value={formData.experience}
                  onValueChange={(v) => set("experience", v)}
                  className="bg-transparent"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="hiring-education">
                  Education Level
                </FieldLabel>
                <Input
                  id="hiring-education"
                  name="education"
                  placeholder="e.g. Bachelor's in CSE"
                  value={formData.education}
                  onValueChange={(v) => set("education", v)}
                  className="bg-transparent"
                />
              </Field>
            </div>

            {/* Skills / Tags */}
            <div className="p-3 sm:p-5 pt-0 sm:pt-0">
              <FieldLabel htmlFor="hiring-skills" className="mb-1.5">
                Required Skills
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="hiring-skills"
                  name="skills"
                  value={skillInput}
                  onValueChange={setSkillInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 bg-transparent"
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
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
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
            <FieldLabel htmlFor="hiring-requirements" className="mb-2.5">
              Requirements
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="hiring-requirements"
                name="requirements"
                value={reqInput}
                onValueChange={setReqInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
                placeholder="Type a requirement and press Enter..."
                className="flex-1 bg-transparent"
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
                    className="flex justify-between items-center bg-muted/50 border border-border/50 rounded-md px-3 py-2 text-sm text-foreground"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(r)}
                      className="hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded-md p-1 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`${sectionClass} p-3 sm:p-5`}>
            <FieldLabel htmlFor="hiring-benefits" className="mb-2.5">
              Benefits &amp; Perks
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="hiring-benefits"
                name="benefits"
                value={benefitInput}
                onValueChange={setBenefitInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBenefit();
                  }
                }}
                placeholder="Type a benefit/perk and press Enter..."
                className="flex-1 bg-transparent"
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
                    className="flex justify-between items-center bg-muted/50 border border-border/50 rounded-md px-3 py-2 text-sm text-foreground"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(b)}
                      className="hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded-md p-1 transition-colors cursor-pointer"
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
            <FieldLabel className="mb-2.5">
              Job Description
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </FieldLabel>
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
              <FieldError className="mt-1">{errors.description}</FieldError>
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
              <Field>
                <FieldLabel id="hiring-status-label" htmlFor="hiring-status">
                  Status
                </FieldLabel>
                <Select
                  id="hiring-status"
                  value={formData.status}
                  onValueChange={(v) => set("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select status"
                      options={HIRING_STATUS_OPTIONS}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItems options={HIRING_STATUS_OPTIONS} />
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="hiring-openings">
                  Number of Openings
                </FieldLabel>
                <Input
                  id="hiring-openings"
                  name="numberOfOpenings"
                  type="number"
                  min={1}
                  placeholder="e.g. 2"
                  value={formData.numberOfOpenings}
                  onValueChange={(v) => set("numberOfOpenings", v)}
                  aria-invalid={errors.numberOfOpenings ? true : undefined}
                  className="bg-transparent"
                />
                {errors.numberOfOpenings && (
                  <FieldError>{errors.numberOfOpenings}</FieldError>
                )}
              </Field>

              {/* Application Deadline */}
              <Field>
                <FieldLabel htmlFor="hiring-deadline">
                  Application Deadline
                </FieldLabel>
                <HugeCalender
                  id="hiring-deadline"
                  value={{
                    start: formData.applicationDeadline
                      ? new Date(formData.applicationDeadline)
                      : null,
                    end: null,
                  }}
                  onChange={(v) =>
                    set(
                      "applicationDeadline",
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
                  inputClass="w-full h-10 bg-transparent"
                  align="right"
                />
              </Field>
            </div>
          </div>

          {/* Company Logo */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>Company Logo</h2>

            <div className="p-3 sm:p-5">
              <div
                role="button"
                onClick={() => logoInputRef.current?.click()}
                className="relative border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-36 overflow-hidden"
              >
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "companyLogo")}
                />
                {logoPreview ? (
                  <div className="absolute inset-2 rounded-lg overflow-hidden">
                    <Image
                      src={logoPreview}
                      alt="Company logo preview"
                      fill
                      className="object-contain p-2"
                      // Blob previews and S3 URLs both bypass the optimiser.
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompanyLogoFile(null);
                        setStoredLogoUrl("");
                      }}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <CloudUploadIcon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary">Click to upload</span> logo
                    </p>
                    <p className="text-[10px] text-muted-foreground">
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
            <div className="p-3 sm:p-5">
              <div
                role="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-40 overflow-hidden"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "bannerImage")}
                />
                {bannerPreview ? (
                  <div className="absolute inset-0">
                    <Image
                      src={bannerPreview}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBannerImageFile(null);
                        setStoredBannerUrl("");
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
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
