"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";

export default function EmployeeFormEditor() {
  const router = useRouter();

  const initialState = {
    name: "",
    email: "",
    roleMode: "",
    password: "",
    phone: "",
    referCommission: "",
    referType: "",
    note: "",
    jobType: "",
    salaryType: "",
    salary: "",
    paymentType: "",
    workingHour: "",
    partTimeDate: "",
    partTimeTime: "",
    dailyWorkingHour: "",
    hourlySalary: "",
  };

  const [formData, setFormData] = useState(initialState);

  const [saving, setSaving] = useState(false);

  const handleFieldChange = (
    field: keyof typeof initialState,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save duration
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    console.log("Saving Employee Data:", formData);
    router.push("/employee/manage");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <Link
          href="/employee/manage"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Add Employee
          </h1>
          <p className="text-[12px] text-text5 dark:text-text6">
            Create a new employee profile and set permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="rounded-xl border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg p-5 sm:p-6 space-y-5">
          {/* Basic Info Section */}
          <div>
            <h2 className="text-base font-semibold text-black dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                required
                fullWidth
                className="dark:border-darkBorder dark:focus:border-darkLight/50"
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                required
                fullWidth
                className="dark:border-darkBorder dark:focus:border-darkLight/50"
              />
              <Select
                label="Role"
                value={formData.roleMode}
                onValueChange={(val) => handleFieldChange("roleMode", val)}
                placeholder="Select a role"
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "Manager", value: "manager" },
                  { label: "Staff", value: "staff" },
                ]}
                className="w-full"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                required
                fullWidth
                className="dark:border-darkBorder dark:focus:border-darkLight/50"
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="e.g. +880 1711 ......"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                fullWidth
                className="dark:border-darkBorder dark:focus:border-darkLight/50"
              />
            </div>
          </div>

          <hr className="border-border/70 dark:border-darkBorder/50" />

          {/* Referral Info Section */}
          <div>
            <h2 className="text-base font-semibold text-black dark:text-white mb-4">
              Referral Attributes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Refer Commission (%)"
                type="number"
                placeholder="e.g. 10"
                value={formData.referCommission}
                onChange={(e) =>
                  handleFieldChange("referCommission", e.target.value)
                }
                fullWidth
                className="dark:border-darkBorder dark:focus:border-darkLight/50"
              />
              <Select
                label="Refer Type"
                value={formData.referType}
                onValueChange={(val) => handleFieldChange("referType", val)}
                placeholder="Select refer type"
                options={[
                  { label: "Wholesaler", value: "wholesaler" },
                  { label: "Retailer", value: "retailer" },
                  { label: "Restaurant", value: "restaurant" },
                  { label: "None", value: "none" },
                ]}
                className="w-full"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Note"
                  placeholder="Enter any note or additional info"
                  value={formData.note}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                  rows={4}
                  className="dark:border-darkBorder dark:focus:border-darkLight/50"
                />
              </div>
            </div>
          </div>

          <hr className="border-border/70 dark:border-darkBorder/50" />

          {/* Employment Section */}
          <div>
            <h2 className="text-base font-semibold text-black dark:text-white mb-4">
              Employment Details
            </h2>
            <div className="mb-5 md:w-1/2 pr-0 md:pr-2.5">
              <Select
                label="Job Type"
                value={formData.jobType || "fulltime"}
                onValueChange={(val) => handleFieldChange("jobType", val)}
                placeholder="Select job type"
                options={[
                  { label: "Full Time / Standard", value: "fulltime" },
                  { label: "Part Time", value: "parttime" },
                  { label: "Hourly Basis", value: "hourly" },
                ]}
                className="w-full"
              />
            </div>

            {/* Conditional renderings based on job type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(!formData.jobType || formData.jobType === "fulltime") && (
                <>
                  <Select
                    label="Salary Type"
                    value={formData.salaryType}
                    onValueChange={(val) =>
                      handleFieldChange("salaryType", val)
                    }
                    placeholder="Select salary type"
                    options={[
                      { label: "Monthly", value: "monthly" },
                      { label: "Weekly", value: "weekly" },
                      { label: "Yearly", value: "yearly" },
                    ]}
                    className="w-full"
                  />
                  <Input
                    label="Amount / Salary"
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.salary}
                    onChange={(e) =>
                      handleFieldChange("salary", e.target.value)
                    }
                    fullWidth
                    className="dark:border-darkBorder dark:focus:border-darkLight/50"
                  />
                  <Select
                    label="Payment Type"
                    value={formData.paymentType}
                    onValueChange={(val) =>
                      handleFieldChange("paymentType", val)
                    }
                    placeholder="Select payment type"
                    options={[
                      { label: "Bank Transfer", value: "bank" },
                      { label: "Cash", value: "cash" },
                      { label: "Cheque", value: "cheque" },
                      { label: "Mobile Banking", value: "mobile_banking" },
                    ]}
                    className="w-full"
                  />
                  <Input
                    label="Working Hour"
                    placeholder="e.g. 9 AM - 5 PM or 8 hours"
                    value={formData.workingHour}
                    onChange={(e) =>
                      handleFieldChange("workingHour", e.target.value)
                    }
                    fullWidth
                    className="dark:border-darkBorder dark:focus:border-darkLight/50"
                  />
                </>
              )}

              {formData.jobType === "parttime" && (
                <>
                  <Input
                    label="Date"
                    type="date"
                    value={formData.partTimeDate}
                    onChange={(e) =>
                      handleFieldChange("partTimeDate", e.target.value)
                    }
                    fullWidth
                    className="dark:border-darkBorder dark:focus:border-darkLight/50"
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={formData.partTimeTime}
                    onChange={(e) =>
                      handleFieldChange("partTimeTime", e.target.value)
                    }
                    fullWidth
                    className="dark:border-darkBorder dark:focus:border-darkLight/50"
                  />
                  <Input
                    label="Daily Working Hour"
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.dailyWorkingHour}
                    onChange={(e) =>
                      handleFieldChange("dailyWorkingHour", e.target.value)
                    }
                    fullWidth
                    className="dark:border-darkBorder dark:focus:border-darkLight/50"
                  />
                </>
              )}

              {formData.jobType === "hourly" && (
                <>
                  <Input
                    label="Hourly Basis Salary"
                    type="number"
                    placeholder="e.g. 15"
                    value={formData.hourlySalary}
                    onChange={(e) =>
                      handleFieldChange("hourlySalary", e.target.value)
                    }
                    fullWidth
                    className="dark:border-darkBorder dark:focus:border-darkLight/50"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/employee/manage"
            className="px-6 py-2.5 rounded-md text-sm font-semibold border border-border text-black dark:text-white dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkBorder/50 transition-all duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                    className="opacity-75"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save Employee"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
