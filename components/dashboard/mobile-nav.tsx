"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, FileText, PlusCircle, ArrowLeft } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Posts", href: "/dashboard/posts", icon: FileText },
    { name: "New Post", href: "/dashboard/posts/new", icon: PlusCircle },
  ];

  return (
    <div className="md:hidden">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 rounded-md text-neutral-500 hover:bg-stone-100 dark:hover:bg-neutral-900/50 transition-colors"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm dark:bg-neutral-950/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-full max-w-[280px] flex-col bg-white dark:bg-neutral-950 p-6 shadow-2xl transition-transform duration-300 ease-in-out border-r border-stone-200 dark:border-neutral-900 h-full">
            {/* Close Button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <span className="font-serif text-md font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Aletheia
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-stone-50" />
                <span className="text-[9px] border border-stone-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1 rounded ml-1">
                  Studio
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-neutral-500 hover:bg-stone-100 dark:hover:bg-neutral-900/50 transition-colors"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2.5 text-sm font-medium px-3.5 py-2.5 rounded-md transition-all duration-200 ${active
                      ? "bg-stone-100 text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50 font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-stone-100 dark:hover:bg-neutral-900/50 hover:text-neutral-950 dark:hover:text-neutral-50"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer actions */}
            <div className="pt-6 border-t border-stone-200 dark:border-neutral-900 space-y-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Site</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default MobileNav;
