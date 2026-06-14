import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PostsTable } from "@/components/dashboard/posts-table";
import { Plus } from "lucide-react";

// Mock publications for safety fallback
const MOCK_POSTS = [
  {
    id: "mock-1",
    title: "The Architecture of Grace: Faith Meets Reason in the Modern Age",
    slug: "the-architecture-of-grace",
    status: "PUBLISHED" as const,
    views: 412,
    category: { name: "Christian Living" },
    createdAt: new Date("2026-06-10T10:00:00Z"),
  },
  {
    id: "mock-2",
    title: "Building Production-Ready REST APIs with Next.js 16 and Prisma",
    slug: "building-apis-nextjs-prisma",
    status: "PUBLISHED" as const,
    views: 389,
    category: { name: "APIs" },
    createdAt: new Date("2026-06-12T09:15:00Z"),
  },
];

export const dynamic = "force-dynamic";

export default async function DashboardPostsPage() {
  let posts: any[] = [];
  let dbSuccess = false;

  try {
    posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
      },
    });
    dbSuccess = true;
  } catch (err) {
    console.warn("DB offline during dashboard posts retrieval, using mock fallback.");
  }

  const displayPosts = dbSuccess ? posts : MOCK_POSTS;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Publications
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {!dbSuccess && "Running in Sandbox Mode (Database Offline - Actions Disabled)"}
            {dbSuccess && "Manage your published devotionals and coding tutorials."}
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-stone-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold px-4 py-2.5 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      <PostsTable initialPosts={displayPosts as any} readOnly={!dbSuccess} />
    </div>
  );
}
