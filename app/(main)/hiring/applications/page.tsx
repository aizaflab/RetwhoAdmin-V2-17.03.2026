"use client";

import { useState, useMemo } from "react";
import { JobApplication } from "@/components/modules/hiring/_types/hiring.types";
import {
  MOCK_JOB_APPLICATIONS,
  MOCK_HIRING_POSTS,
} from "@/components/modules/hiring/_data/mock-hiring";
import ApplicationListTable from "@/components/modules/hiring/_components/ApplicationListTable";
import { toast } from "sonner";
import { SimpleSelect } from "@/components/ui";

export default function ManageApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>(
    MOCK_JOB_APPLICATIONS,
  );

  const [selectedJobId, setSelectedJobId] = useState<string>("all");

  const handleStatusChange = (id: string, status: JobApplication["status"]) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app)),
    );
    toast.success(`Application updated to ${status}`);
  };

  const jobOptions = useMemo(() => {
    return [
      { value: "all", label: "All Job Posts" },
      ...MOCK_HIRING_POSTS.map((post) => ({
        value: post.id,
        label: post.title,
      })),
    ];
  }, []);

  const filteredApplications = useMemo(() => {
    if (selectedJobId === "all") return applications;
    return applications.filter((app) => app.hiringId === selectedJobId);
  }, [applications, selectedJobId]);

  const selectedJobName =
    selectedJobId === "all"
      ? "All Applications"
      : MOCK_HIRING_POSTS.find((p) => p.id === selectedJobId)?.title ||
        "Applications";

  const stats = useMemo(() => {
    return {
      total: filteredApplications.length,
      reviewed: filteredApplications.filter((a) => a.status === "reviewed")
        .length,
      shortlisted: filteredApplications.filter(
        (a) => a.status === "shortlisted",
      ).length,
      hired: filteredApplications.filter((a) => a.status === "hired").length,
    };
  }, [filteredApplications]);

  return (
    <div className="space-y-4">
      {/* Compact Filter Row */}
      <div className="p-3 sm:p-4 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Minimal Stats Inline */}
        <div className="flex items-center gap-4 text-[13px] w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-text5 font-medium">Total:</span>
            <span className="text-black dark:text-white px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-bold min-w-[24px] text-center">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-text5 font-medium">Reviewed:</span>
            <span className="text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 font-bold min-w-[24px] text-center">
              {stats.reviewed}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-text5 font-medium">Shortlisted:</span>
            <span className="text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 font-bold min-w-[24px] text-center">
              {stats.shortlisted}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-text5 font-medium">Hired:</span>
            <span className="text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 font-bold min-w-[24px] text-center">
              {stats.hired}
            </span>
          </div>
        </div>

        <div className="w-full md:w-[280px]">
          <SimpleSelect
            options={jobOptions}
            value={selectedJobId}
            onChange={setSelectedJobId}
            className="h-10 rounded-md bg-white dark:bg-darkBg"
          />
        </div>
      </div>

      <div className="min-h-[calc(100dvh-150px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
        <ApplicationListTable
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          title={selectedJobName}
        />
      </div>
    </div>
  );
}
