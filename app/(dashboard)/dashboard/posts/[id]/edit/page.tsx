import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/dashboard/post-form";
import { updatePost } from "@/actions/posts";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  let post = null;
  let categories: { id: string; name: string }[] = [];
  let tags: { id: string; name: string }[] = [];
  let dbSuccess = false;

  try {
    post = await prisma.post.findUnique({
      where: { id },
      include: {
        tags: { select: { id: true } },
      },
    });

    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    dbSuccess = true;
  } catch (err) {
    console.warn("DB offline during edit page load.");
  }

  if (!dbSuccess) {
    return (
      <div className="bg-amber-50 text-amber-800 border border-amber-200/50 p-4 rounded text-xs leading-relaxed">
        The database is currently offline. Unable to load the edit publication interface in Sandbox/Mock Mode.
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const initialData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage || "",
    categoryId: post.categoryId,
    status: post.status,
    tagIds: post.tags.map((t) => t.id),
  };

  // Bind the post ID to the updatePost Server Action
  const updatePostWithId = updatePost.bind(null, id);

  return (
    <div className="space-y-6">
      <PostForm
        categories={categories}
        tags={tags}
        onSubmitAction={updatePostWithId}
        initialData={initialData}
      />
    </div>
  );
}
