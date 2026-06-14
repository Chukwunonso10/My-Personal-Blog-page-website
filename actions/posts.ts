"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod Validation Schema for creating/editing posts
const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  slug: z.string().min(3, "Slug must be at least 3 characters long."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters long."),
  content: z.string().min(20, "Content must be at least 20 characters long."),
  coverImage: z.string().url("Please provide a valid cover image URL.").or(z.string().length(0)).nullable(),
  categoryId: z.string().uuid("Please select a valid category."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  tagIds: z.array(z.string().uuid()).default([]),
});

// Auth Guard Helper
async function assertAuthor() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized: You must be signed in.");
  }

  const isAdminEmail = clerkUser.emailAddresses[0]?.emailAddress.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  // Gracefully handle database checks
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  }).catch(() => null);

  if (dbUser && isAdminEmail && dbUser.role !== "ADMIN") {
    try {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: "ADMIN" },
      });
    } catch (err) {
      console.error("Failed to automatically promote admin user role:", err);
    }
  }

  if (!dbUser) {
    // If DB is offline but clerk user matches admin email, return a mock author context
    if (isAdminEmail) {
      return { id: "mock-admin-id", role: "ADMIN", clerkId: clerkUser.id };
    }
    throw new Error("Forbidden: Author profile not synced.");
  }

  if (dbUser.role !== "ADMIN" && dbUser.role !== "WRITER") {
    throw new Error("Forbidden: You do not have permissions to write posts.");
  }

  return dbUser;
}

// Calculate Estimated Reading Time (200 words/min)
function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Server Action: Increment Views
export async function incrementPostViews(slug: string): Promise<{ success: boolean }> {
  try {
    await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });
    revalidatePath(`/articles/${slug}`);
    return { success: true };
  } catch (err) {
    console.error("Failed to increment views:", err);
    return { success: false };
  }
}

// Server Action: Create Post
export async function createPost(rawFields: any) {
  try {
    const author = await assertAuthor();
    
    // If we are using mock-admin context because DB is offline, prevent writes
    if (author.id === "mock-admin-id") {
      return { success: false, message: "Database is offline. Unable to save post." };
    }

    const fields = postSchema.parse(rawFields);
    const readingTime = calculateReadingTime(fields.content);

    const post = await prisma.post.create({
      data: {
        title: fields.title,
        slug: fields.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        excerpt: fields.excerpt,
        content: fields.content,
        coverImage: fields.coverImage || null,
        status: fields.status,
        readingTime,
        authorId: author.id,
        categoryId: fields.categoryId,
        publishedAt: fields.status === "PUBLISHED" ? new Date() : null,
        tags: {
          connect: fields.tagIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/articles");
    return { success: true, post };
  } catch (err: any) {
    console.error("Create post error:", err);
    return {
      success: false,
      message: err instanceof z.ZodError ? err.issues[0].message : err.message || "Failed to create post.",
    };
  }
}

// Server Action: Edit Post
export async function updatePost(id: string, rawFields: any) {
  try {
    const author = await assertAuthor();
    
    if (author.id === "mock-admin-id") {
      return { success: false, message: "Database is offline. Unable to update post." };
    }

    const fields = postSchema.parse(rawFields);
    const readingTime = calculateReadingTime(fields.content);

    // Verify ownership or admin privileges
    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) {
      return { success: false, message: "Post not found." };
    }
    if (existingPost.authorId !== author.id && author.role !== "ADMIN") {
      return { success: false, message: "Unauthorized edit attempt." };
    }

    // Prepare tag disconnect
    await prisma.post.update({
      where: { id },
      data: {
        tags: { set: [] } // Clear current tags
      }
    });

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: fields.title,
        slug: fields.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        excerpt: fields.excerpt,
        content: fields.content,
        coverImage: fields.coverImage || null,
        status: fields.status,
        readingTime,
        categoryId: fields.categoryId,
        publishedAt: fields.status === "PUBLISHED" && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
        tags: {
          connect: fields.tagIds.map((tid) => ({ id: tid })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${post.slug}`);
    return { success: true, post };
  } catch (err: any) {
    console.error("Update post error:", err);
    return {
      success: false,
      message: err instanceof z.ZodError ? err.issues[0].message : err.message || "Failed to update post.",
    };
  }
}

// Server Action: Delete Post
export async function deletePost(id: string) {
  try {
    const author = await assertAuthor();
    
    if (author.id === "mock-admin-id") {
      return { success: false, message: "Database is offline. Unable to delete post." };
    }

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) return { success: false, message: "Post not found." };

    if (existingPost.authorId !== author.id && author.role !== "ADMIN") {
      return { success: false, message: "Unauthorized delete attempt." };
    }

    await prisma.post.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/articles");
    return { success: true, message: "Post deleted successfully." };
  } catch (err: any) {
    console.error("Delete post error:", err);
    return { success: false, message: err.message || "Failed to delete post." };
  }
}

// Server Action: Toggle Publish Status
export async function togglePostStatus(id: string) {
  try {
    const author = await assertAuthor();
    
    if (author.id === "mock-admin-id") {
      return { success: false, message: "Database is offline." };
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return { success: false, message: "Post not found." };

    if (post.authorId !== author.id && author.role !== "ADMIN") {
      return { success: false, message: "Unauthorized." };
    }

    const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${post.slug}`);
    return { success: true, status: newStatus };
  } catch (err: any) {
    console.error("Toggle publish status error:", err);
    return { success: false, message: err.message };
  }
}
