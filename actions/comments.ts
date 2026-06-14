"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createComment(
  postId: string,
  content: string,
  postSlug: string
): Promise<{ success: boolean; message: string }> {
  const user = await currentUser();
  if (!user) {
    return { success: false, message: "You must be signed in to post a comment." };
  }

  if (!content || content.trim().length < 3) {
    return { success: false, message: "Comment must be at least 3 characters long." };
  }

  try {
    // Sync lookup
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    }).catch(() => null);

    if (!dbUser) {
      return {
        success: false,
        message: "Your profile is not synced. Please try logging out and back in.",
      };
    }

    await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId: dbUser.id,
      },
    });

    revalidatePath(`/articles/${postSlug}`);
    return { success: true, message: "Comment posted successfully!" };
  } catch (err) {
    console.error("Failed to create comment:", err);
    return {
      success: false,
      message: "Unable to post comment. The database may be offline.",
    };
  }
}
