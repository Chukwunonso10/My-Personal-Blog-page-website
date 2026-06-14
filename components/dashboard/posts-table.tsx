"use client";

import React, { useTransition, useState } from "react";
import Link from "next/link";
import { togglePostStatus, deletePost } from "@/actions/posts";
import { Edit2, Trash2, Globe, FileEdit, Loader2, Link as LinkIcon } from "lucide-react";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  views: number;
  category: { name: string };
  createdAt: Date;
}

interface PostsTableProps {
  initialPosts: PostItem[];
  readOnly?: boolean;
}

export function PostsTable({ initialPosts, readOnly = false }: PostsTableProps) {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);

  const handleToggleStatus = (id: string) => {
    if (readOnly) return;
    setError("");
    setLoadingPostId(id);
    
    startTransition(async () => {
      const res = await togglePostStatus(id);
      if (res.success && res.status) {
        setPosts(
          posts.map((p) => (p.id === id ? { ...p, status: res.status as "DRAFT" | "PUBLISHED" } : p))
        );
      } else {
        setError(res.message || "Failed to update post status.");
      }
      setLoadingPostId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (readOnly) return;
    if (!confirm("Are you sure you want to delete this publication? This action is irreversible.")) {
      return;
    }

    setError("");
    setLoadingPostId(id);

    startTransition(async () => {
      const res = await deletePost(id);
      if (res.success) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        setError(res.message || "Failed to delete post.");
      }
      setLoadingPostId(null);
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-xs border border-red-200/50">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white border border-stone-200/80 rounded-lg dark:border-neutral-900 dark:bg-neutral-900/10 shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="text-xs text-neutral-400 border-b border-stone-100 dark:border-neutral-900 bg-stone-50/50 dark:bg-neutral-900/20">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium text-center">Status</th>
              <th className="p-4 font-medium text-right">Views</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-neutral-900">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-neutral-400 text-xs">
                  No posts found. Create your first post to begin.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="text-neutral-700 dark:text-neutral-300 hover:bg-stone-50/20 dark:hover:bg-neutral-900/10">
                  <td className="p-4 font-medium truncate max-w-xs sm:max-w-sm">
                    <div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-100">{post.title}</p>
                      <p className="text-[10px] text-neutral-400 pt-0.5 font-mono">{post.slug}</p>
                    </div>
                  </td>
                  <td className="p-4">{post.category.name}</td>
                  <td className="p-4 text-center">
                    <button
                      disabled={readOnly || isPending}
                      onClick={() => handleToggleStatus(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
                        post.status === "PUBLISHED"
                          ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400"
                          : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {loadingPostId === post.id && isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : post.status === "PUBLISHED" ? (
                        <Globe className="w-3 h-3" />
                      ) : (
                        <FileEdit className="w-3 h-3" />
                      )}
                      <span>{post.status}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right font-mono text-xs">{post.views.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2.5">
                      {post.status === "PUBLISHED" && (
                        <Link
                          href={`/articles/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="View Live"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors ${
                          readOnly ? "pointer-events-none opacity-50" : ""
                        }`}
                        title="Edit Post"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        disabled={readOnly || isPending}
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/10 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        {loadingPostId === post.id && isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default PostsTable;
