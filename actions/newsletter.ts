"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

export type FormState = {
  success: boolean;
  message: string;
} | null;

export async function subscribeNewsletter(formData: FormData): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email") as string;
  
  const result = schema.safeParse({ email });
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  try {
    // If DB isn't ready/connected, gracefully catch it
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    }).catch(() => null);

    if (existing) {
      return {
        success: true,
        message: "You are already subscribed to our publication newsletter.",
      };
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
      },
    }).catch((e) => {
      throw e;
    });

    return {
      success: true,
      message: "Thank you for subscribing! We've registered your email.",
    };
  } catch (error) {
    console.error("Newsletter error:", error);
    return {
      success: false,
      message: "Unable to subscribe right now. The database may be offline.",
    };
  }
}
