import React from "react";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/dashboard/post-form";
import { createPost } from "@/actions/posts";

// Fallback arrays for sandbox mode
const MOCK_CATEGORIES = [
  { id: "c1", name: "Christian Living" },
  { id: "c2", name: "Bible Study" },
  { id: "c3", name: "Devotional" },
  { id: "c4", name: "Software Engineering" },
  { id: "c5", name: "APIs" },
  { id: "c6", name: "Web Development" },
  { id: "c7", name: "Career" },
];

const MOCK_TAGS = [
  { id: "t1", name: "Grace" },
  { id: "t2", name: "Faith" },
  { id: "t3", name: "Next.js" },
  { id: "t4", name: "React" },
  { id: "t5", name: "TypeScript" },
  { id: "t6", name: "PostgreSQL" },
  { id: "t7", name: "API Design" },
  { id: "t8", name: "Spiritual Growth" },
];

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  let categories: { id: string; name: string }[] = [];
  let tags: { id: string; name: string }[] = [];
  let dbSuccess = false;

  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    dbSuccess = true;
  } catch (err) {
    console.warn("DB offline during editor setup. Using mock listings.");
  }

  const finalCategories = dbSuccess ? categories : MOCK_CATEGORIES;
  const finalTags = dbSuccess ? tags : MOCK_TAGS;

  return (
    <div className="space-y-6">
      {!dbSuccess && (
        <div className="bg-amber-50 text-amber-800 border border-amber-200/50 p-4 rounded text-xs leading-relaxed">
          The database is currently offline. You can test typing in the writing editor interface, but saving is disabled until the connection is restored.
        </div>
      )}
      <PostForm
        categories={finalCategories}
        tags={finalTags}
        onSubmitAction={createPost}
      />
    </div>
  );
}
