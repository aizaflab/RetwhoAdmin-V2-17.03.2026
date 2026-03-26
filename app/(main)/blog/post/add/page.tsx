"use client";

import { useRouter } from "next/navigation";
import { BlogPost } from "@/components/modules/blog/_types/blog.types";
import { MOCK_BLOG_CATEGORIES } from "@/components/modules/blog/_data/mock-blog";
import BlogPostForm from "@/components/modules/blog/_components/BlogPostForm";
import { MoveLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddBlogPage() {
  const router = useRouter();

  const handleSave = (data: Partial<BlogPost>) => {
    // Here you would typically make an API call to save the data
    console.log("Saving new blog post:", data);
    toast.success("Blog post created successfully!");
    router.push("/blog/post/manage");
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white dark:bg-darkPrimary border border-border/50 dark:border-darkBorder/50 hover:bg-gray-50 dark:hover:bg-darkBorder/40 transition-colors"
        >
          <MoveLeft className="w-5 h-5 text-black dark:text-white" />
        </button>
        <div>
          <h1 className="sm:text-2xl text-xl font-medium text-black">
            Add New Post
          </h1>
          <p className="text-sm text-text5 mt-0.5">Create a new blog article</p>
        </div>
      </div>

      <BlogPostForm categories={MOCK_BLOG_CATEGORIES} onSave={handleSave} />
    </div>
  );
}
