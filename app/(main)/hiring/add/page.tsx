"use client";

import { useRouter } from "next/navigation";
import { HiringPost } from "@/components/modules/hiring/_types/hiring.types";
import { MOCK_HIRING_CATEGORIES } from "@/components/modules/hiring/_data/mock-hiring";
import HiringPostForm from "@/components/modules/hiring/_components/HiringPostForm";
import { toast } from "sonner";

export default function AddHiringPage() {
  const router = useRouter();

  const handleSave = (data: Partial<HiringPost>) => {
    // API call logic typically goes here
    console.log("Saving new hiring post:", data);
    toast.success("Hiring post created successfully!");
    router.push("/hiring/manage");
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <HiringPostForm categories={MOCK_HIRING_CATEGORIES} onSave={handleSave} />
    </div>
  );
}
