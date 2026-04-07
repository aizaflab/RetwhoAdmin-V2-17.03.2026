"use client";

import { useState, useEffect } from "react";
import { JobApplication } from "../_types/hiring.types";
import { format } from "date-fns";
import Image from "next/image";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  BriefcaseBusiness,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";

interface ApplicationViewDrawerProps {
  application: JobApplication;
  onClose: () => void;
  onStatusChange?: (id: string, status: JobApplication["status"]) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  reviewed: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  shortlisted:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
  rejected: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  hired:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
};

export default function ApplicationViewDrawer({
  application,
  onClose,
  onStatusChange,
}: ApplicationViewDrawerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 h-screen z-500 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        className="fixed top-0 right-0 z-501 h-full w-full max-w-md
                   flex flex-col bg-white dark:bg-darkPrimary
                   border-l border-border/40 dark:border-white/5
                   shadow-xl transition-transform duration-500 ease-out"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 center text-primary overflow-hidden">
              {application.applicantPhoto ? (
                <Image
                  src={application.applicantPhoto}
                  alt={application.applicantName}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-black dark:text-white leading-tight">
                {application.applicantName}
              </h2>
              <p className="text-[11px] text-text5 mt-0.5">
                Applied{" "}
                {format(new Date(application.appliedAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-darkBorder/40 hover:bg-gray-200 dark:hover:bg-darkBorder/80 transition-colors text-text5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
          {/* Status & Role Info */}
          <div className="bg-gray-50 dark:bg-darkBorder/20 rounded-lg p-4 border border-gray-100 dark:border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <BriefcaseBusiness className="w-3 h-3" />
                  Applied Role
                </p>
                <h3 className="text-sm font-semibold text-black dark:text-white">
                  {application.hiringTitle}
                </h3>
                <p className="text-[11px] text-text5 mt-0.5">
                  {application.companyName}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[application.status]}`}
              >
                {application.status}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
              Contact Info
            </h3>
            <div className="grid gap-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`mailto:${application.applicantEmail}`}
                  className="text-text4 font-medium hover:text-primary transition-colors truncate"
                >
                  {application.applicantEmail}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="text-text4 font-medium">
                  {application.applicantPhone}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-500 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-text4 font-medium">
                  {application.applicantLocation}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
              Applicant Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-darkBorder/20 rounded-lg p-3 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3" />
                  Expected Pay
                </p>
                <p className="text-sm font-semibold text-black dark:text-white">
                  {application.expectedSalary
                    ? `৳ ${application.expectedSalary.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-darkBorder/20 rounded-lg p-3 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Available From
                </p>
                <p className="text-sm font-semibold text-black dark:text-white truncate">
                  {application.availableFrom
                    ? format(
                        new Date(application.availableFrom),
                        "MMM dd, yyyy",
                      )
                    : "ASAP"}
                </p>
              </div>
            </div>
          </div>

          {/* Links & Attachments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
              Links & Documents
            </h3>
            <div className="grid gap-2">
              {application.resumeUrl && (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 group hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      Download Resume
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-red-400 group-hover:text-red-600 transition-colors" />
                </a>
              )}
              <div className="flex items-center gap-3">
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-darkBorder/20 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-text4">
                      Portfolio Website
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-text5" />
                  </a>
                )}
                {application.linkedInUrl && (
                  <a
                    href={application.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-between p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      LinkedIn Profile
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
              Cover Letter / Message
            </h3>
            <div className="bg-gray-50 dark:bg-darkBorder/20 p-4 rounded-lg border border-gray-100 dark:border-white/5">
              <p className="text-sm text-text4 leading-relaxed whitespace-pre-wrap italic">
                &quot;{application.coverLetter}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4  bg-gray-50 dark:bg-darkBorder/20 shrink-0">
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-white dark:bg-transparent text-black dark:text-white border-border dark:border-darkBorder"
              variant="outline"
              onClick={() => {
                onStatusChange?.(application.id, "rejected");
                handleClose();
              }}
            >
              Reject
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                onStatusChange?.(application.id, "shortlisted");
                handleClose();
              }}
            >
              Shortlist
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                onStatusChange?.(application.id, "hired");
                handleClose();
              }}
            >
              Hire
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
