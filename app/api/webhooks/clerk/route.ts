import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env"
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get raw body
  const body = await req.text();

  // Create a new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred during signature verification", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id: clerkId, email_addresses, username, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (!clerkId || !email) {
      return new Response("Missing required user details in payload", { status: 400 });
    }

    // Auto-promote user to ADMIN if matches ADMIN_EMAIL env variable
    const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
    const role = isAdmin ? "ADMIN" : "READER";

    try {
      await prisma.user.create({
        data: {
          clerkId,
          email,
          username: username || `user_${Math.random().toString(36).slice(2, 7)}`,
          image: image_url || null,
          role,
        },
      });
      return new Response("User created successfully in database", { status: 201 });
    } catch (dbErr) {
      console.error("Error creating user in database:", dbErr);
      return new Response("Database write error", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id: clerkId, email_addresses, username, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (!clerkId || !email) {
      return new Response("Missing required user details in payload", { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          username: username || undefined,
          image: image_url || null,
        },
      });
      return new Response("User updated successfully in database", { status: 200 });
    } catch (dbErr) {
      console.error("Error updating user in database:", dbErr);
      return new Response("Database update error", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id: clerkId } = evt.data;

    if (!clerkId) {
      return new Response("Missing clerkId in payload", { status: 400 });
    }

    try {
      await prisma.user.delete({
        where: { clerkId },
      });
      return new Response("User deleted successfully from database", { status: 200 });
    } catch (dbErr) {
      console.error("Error deleting user from database:", dbErr);
      return new Response("Database delete error", { status: 500 });
    }
  }

  return new Response("Webhook event processed", { status: 200 });
}
