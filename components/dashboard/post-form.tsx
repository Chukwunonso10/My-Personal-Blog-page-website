"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Save, FileText, Eye, Info } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
  coverImage: z.string().url("Please enter a valid URL.").or(z.string().length(0)).nullable(),
  categoryId: z.string().uuid("Please select a category."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  tagIds: z.array(z.string().uuid()),
});

type FormValues = z.infer<typeof formSchema>;

interface PostFormProps {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  onSubmitAction: (data: FormValues) => Promise<{ success: boolean; message?: string }>;
  initialData?: Partial<FormValues> & { id?: string };
}

export function PostForm({ categories, tags, onSubmitAction, initialData }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      coverImage: initialData?.coverImage || "",
      categoryId: initialData?.categoryId || "",
      status: initialData?.status || "DRAFT",
      tagIds: initialData?.tagIds || [],
    },
  });

  const titleValue = watch("title");
  const contentValue = watch("content");

  // Auto-generate slug from title
  React.useEffect(() => {
    if (titleValue && !initialData) {
      const generated = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // clean redundant hyphens
      setValue("slug", generated);
    }
  }, [titleValue, setValue, initialData]);

  const onFormSubmit = (values: FormValues) => {
    setError("");
    startTransition(async () => {
      const res = await onSubmitAction(values);
      if (res.success) {
        router.push("/dashboard/posts");
        router.refresh();
      } else {
        setError(res.message || "An error occurred while saving the post.");
      }
    });
  };

  const handleTagToggle = (tagId: string) => {
    const currentTags = watch("tagIds") || [];
    if (currentTags.includes(tagId)) {
      setValue("tagIds", currentTags.filter((id) => id !== tagId));
    } else {
      setValue("tagIds", [...currentTags, tagId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200/50 p-4 rounded text-xs">
          {error}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 dark:border-neutral-900 pb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {initialData ? "Edit Publication" : "Create New Publication"}
          </h2>
          <p className="text-xs text-neutral-400">
            Write your thoughts in MDX. Remember to style headers, lists, and callouts.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/posts"
            className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300 text-xs font-semibold px-3.5 py-2 rounded"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-stone-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold px-4 py-2 rounded cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Article</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Columns (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          {/* Title input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-neutral-500">Post Title</label>
            <input
              type="text"
              {...register("title")}
              placeholder="e.g., The Architecture of Grace"
              className="w-full text-md p-3 rounded bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-stone-50"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Slug input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-neutral-500">Post Slug (URL)</label>
            <input
              type="text"
              {...register("slug")}
              placeholder="e.g., the-architecture-of-grace"
              className="w-full text-xs p-3 rounded bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-stone-50 font-mono"
            />
            {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-neutral-500">Excerpt / Subtitle</label>
            <textarea
              rows={3}
              {...register("excerpt")}
              placeholder="Provide a concise one-sentence editorial summary..."
              className="w-full text-sm p-3 rounded bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-stone-50"
            />
            {errors.excerpt && <p className="text-xs text-red-500">{errors.excerpt.message}</p>}
          </div>

          {/* Editor Tabs (Write vs Preview) */}
          <div className="space-y-3">
            <div className="flex border-b border-stone-200 dark:border-neutral-900 pb-1 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`text-xs font-bold uppercase pb-2 px-1 border-b-2 cursor-pointer transition-all ${
                  activeTab === "write"
                    ? "border-neutral-900 text-neutral-900 dark:border-stone-50 dark:text-neutral-50"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Write
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`text-xs font-bold uppercase pb-2 px-1 border-b-2 cursor-pointer transition-all ${
                  activeTab === "preview"
                    ? "border-neutral-900 text-neutral-900 dark:border-stone-50 dark:text-neutral-50"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </span>
              </button>
            </div>

            {activeTab === "write" ? (
              <div className="space-y-2">
                <textarea
                  rows={16}
                  {...register("content")}
                  placeholder="Write your article in markdown/MDX here. Use markdown elements like headings, lists, blockquotes, and custom tags like <Callout type='info'>...</Callout>"
                  className="w-full text-sm p-4 rounded bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-stone-50 font-mono leading-relaxed"
                />
                {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                
                {/* Guidelines note */}
                <div className="bg-stone-50 dark:bg-neutral-900 p-4 border rounded flex gap-3 text-xs text-neutral-500 leading-relaxed">
                  <Info className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">Editor Guidelines:</p>
                    <p>Use custom components inside markdown: <code>&lt;Callout type="warning"&gt;Important Alert&lt;/Callout&gt;</code> or <code>&lt;YouTubeEmbed id="videoId" /&gt;</code> for embedded video players.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border rounded-md p-6 max-h-[500px] overflow-y-auto dark:bg-neutral-900/10 dark:border-neutral-900">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {contentValue ? (
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {contentValue}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 text-center py-12">Nothing to preview yet. Start writing.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Parameters Column (1/3 width) */}
        <div className="space-y-6 bg-white dark:bg-neutral-900/10 p-5 rounded-lg border border-stone-200 dark:border-neutral-900 h-fit shadow-sm">
          {/* Status SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-neutral-400">Publish Status</label>
            <select
              {...register("status")}
              className="w-full text-xs p-2.5 rounded bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="DRAFT">Draft (Unpublished)</option>
              <option value="PUBLISHED">Published (Live)</option>
            </select>
          </div>

          {/* Category SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-neutral-400">Category</label>
            <select
              {...register("categoryId")}
              className="w-full text-xs p-2.5 rounded bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="">Select a Category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-neutral-400">Cover Image URL</label>
            <input
              type="text"
              {...register("coverImage")}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 rounded bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            {errors.coverImage && <p className="text-xs text-red-500">{errors.coverImage.message}</p>}
          </div>

          {/* Tags CHECKBOXES */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-400 block border-b pb-1">Tags</label>
            <div className="max-h-48 overflow-y-auto space-y-2 pt-1 pr-1 scrollbar-none">
              {tags.map((tag) => {
                const currentTagIds = watch("tagIds") || [];
                const isChecked = currentTagIds.includes(tag.id);
                return (
                  <label key={tag.id} className="flex items-center space-x-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTagToggle(tag.id)}
                      className="rounded text-neutral-900 focus:ring-neutral-900 dark:focus:ring-stone-50 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{tag.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
export default PostForm;
