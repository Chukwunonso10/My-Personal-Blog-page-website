"use client";

import React, { useState, useTransition } from "react";
import { Show } from "@clerk/nextjs";
import { createComment } from "@/actions/comments";
import { Loader2, MessageSquare, Send } from "lucide-react";

interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    username: string | null;
    image: string | null;
  };
}

interface CommentsSectionProps {
  postId: string;
  postSlug: string;
  initialComments: CommentWithUser[];
}

export function CommentsSection({ postId, postSlug, initialComments }: CommentsSectionProps) {
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError("");
    
    startTransition(async () => {
      const res = await createComment(postId, content, postSlug);
      if (res.success) {
        setContent("");
        // Optimistically add to comments local state
        const newComment: CommentWithUser = {
          id: `temp-${Date.now()}`,
          content: content.trim(),
          createdAt: new Date(),
          user: {
            username: "You",
            image: null,
          },
        };
        setComments([newComment, ...comments]);
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="space-y-8 pt-10 border-t border-stone-200 dark:border-neutral-800">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-neutral-500" />
        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="bg-stone-50 dark:bg-neutral-900/20 p-5 rounded-lg border border-stone-200/60 dark:border-neutral-800/60">
        <Show when="signed-in">
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              required
              rows={3}
              placeholder="Join the discussion... (Markdown is supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm p-3 rounded-md bg-white border border-stone-200 dark:border-neutral-800 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-stone-50"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-stone-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-white text-xs font-semibold px-4 py-2.5 rounded-md disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Comment</span>
              </button>
            </div>
          </form>
        </Show>

        <Show when="signed-out">
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              You must be signed in to post a comment.
            </p>
            <a
              href="/sign-in"
              className="inline-block text-xs font-semibold underline text-neutral-800 dark:text-neutral-200"
            >
              Sign In
            </a>
          </div>
        </Show>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-4">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 items-start text-sm">
              <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-800 flex items-center justify-center font-semibold text-neutral-500 text-xs flex-shrink-0">
                {comment.user.image ? (
                  <img src={comment.user.image} alt="User Avatar" className="w-full h-full rounded-full" />
                ) : (
                  comment.user.username?.slice(0, 2).toUpperCase() || "US"
                )}
              </div>
              <div className="space-y-1.5 flex-1 bg-white border border-stone-200/50 dark:border-neutral-900 dark:bg-neutral-900/5 p-4 rounded-md">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {comment.user.username || "Anonymous"}
                  </span>
                  <span>
                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default CommentsSection;
