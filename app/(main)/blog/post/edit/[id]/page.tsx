"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/components/modules/blog/_types/blog.types";
import {
  MOCK_BLOG_POSTS,
  MOCK_BLOG_CATEGORIES,
} from "@/components/modules/blog/_data/mock-blog";
import BlogPostForm from "@/components/modules/blog/_components/BlogPostForm";
import { MoveLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const post = MOCK_BLOG_POSTS.find((p) => p.id === id);

  useEffect(() => {
    if (!post && id) {
      toast.error("Blog post not found.");
      router.push("/blog/post/manage");
    }
  }, [post, id, router]);

  const handleSave = (data: Partial<BlogPost>) => {
    // Mock save
    console.log("Updating blog post:", data);
    toast.success("Blog post updated successfully!");
    router.push("/blog/post/manage");
  };

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-[#fafafa] dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white dark:bg-darkPrimary border border-border/50 dark:border-darkBorder/50 hover:bg-gray-50 dark:hover:bg-darkBorder/40 transition-colors"
        >
          <MoveLeft className="w-5 h-5 text-black dark:text-white" />
        </button>
        <div>
          <h1 className="sm:text-2xl text-xl font-medium">Edit Post</h1>
          <p className="text-sm text-text5 mt-0.5">Editing: {post.title}</p>
        </div>
      </div>

      <BlogPostForm
        initialData={post}
        categories={MOCK_BLOG_CATEGORIES}
        onSave={handleSave}
      />
    </div>
  );
}
