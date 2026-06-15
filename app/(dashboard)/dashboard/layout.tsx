import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Show, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, FileText, PlusCircle, ArrowLeft, ShieldAlert } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  let dbUser = null;
  const isAdminEmail = clerkUser.emailAddresses[0]?.emailAddress.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  try {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (dbUser && isAdminEmail && dbUser.role !== "ADMIN") {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: "ADMIN" },
      });
    }
  } catch (err) {
    console.warn("Database offline or error during dashboard auth check, using email bypass.");
  }

  const isAdminOrWriter =
    dbUser?.role === "ADMIN" ||
    dbUser?.role === "WRITER" ||
    isAdminEmail;

  if (!isAdminOrWriter) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-stone-50 text-center px-6 dark:bg-neutral-950 transition-colors duration-300">
        <ShieldAlert className="w-12 h-12 text-neutral-400 mb-4 animate-pulse" />
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Access Denied
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
          You do not have writer or administrator privileges on this platform. Please contact the site owner if you believe this is a mistake.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-stone-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold px-4 py-2.5 rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>
      </div>
    );
  }

  const sidebarLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Posts", href: "/dashboard/posts", icon: FileText },
    { name: "New Post", href: "/dashboard/posts/new", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50/40 dark:bg-neutral-950 transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-stone-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 flex-shrink-0 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Chukwunonso's Blog
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-stone-50" />
            <span className="text-[9px] border border-stone-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1 rounded ml-2">
              Studio
            </span>
          </div>

          <nav className="space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-2.5 text-sm font-medium px-3.5 py-2.5 rounded-md hover:bg-stone-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-stone-200 dark:border-neutral-900 space-y-4">
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Site</span>
          </Link>
          <div className="flex items-center justify-between pt-2">
            <ThemeToggle />
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Banner */}
        <header className="h-14 border-b border-stone-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center space-x-2">
            <MobileNav />
            <span className="font-serif text-md font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Chukwunonso's Blog
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-stone-50" />
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
