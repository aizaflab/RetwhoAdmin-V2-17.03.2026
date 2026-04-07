// ─── Hiring Module Types ────────────────────────────────────────────────────

export type HiringStatus = "active" | "inactive" | "closed" | "draft";
export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance"
  | "remote";
export type SalaryType = "monthly" | "weekly" | "hourly" | "yearly" | "fixed";
export type CategoryType = "job" | "service";
export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "hired";

// ─── Hiring Category ─────────────────────────────────────────────────────────
export interface HiringCategory {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  postCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

// ─── Hiring Post ─────────────────────────────────────────────────────────────
export interface HiringPost {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  bannerImage?: string;
  categoryId: string;
  address: string;
  city: string;
  country: string;
  jobType: JobType;
  salaryMin: number;
  salaryMax: number;
  salaryType: SalaryType;
  currency: string;
  description: string; // rich text / HTML
  requirements: string[]; // list items
  benefits: string[]; // list items
  skills: string[]; // tags
  experience: string; // e.g. "2-4 years"
  education: string; // e.g. "Bachelor's"
  openings: number;
  deadline?: string; // ISO date
  status: HiringStatus;
  views: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Job Application ─────────────────────────────────────────────────────────
export interface JobApplication {
  id: string;
  hiringId: string;
  hiringTitle: string;
  companyName: string;

  // Applicant info
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLocation: string;
  applicantPhoto?: string;

  // Application data
  coverLetter: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  expectedSalary?: number;
  availableFrom?: string; // ISO date

  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}
