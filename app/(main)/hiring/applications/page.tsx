"use client";

import { useState } from "react";
import { JobApplication } from "@/components/modules/hiring/_types/hiring.types";
import { MOCK_JOB_APPLICATIONS } from "@/components/modules/hiring/_data/mock-hiring";
import ApplicationListTable from "@/components/modules/hiring/_components/ApplicationListTable";
import { toast } from "sonner";

export default function ManageApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>(
    MOCK_JOB_APPLICATIONS,
  );

  const handleStatusChange = (id: string, status: JobApplication["status"]) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app)),
    );
    toast.success(`Application updated to ${status}`);
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <ApplicationListTable
        applications={applications}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
