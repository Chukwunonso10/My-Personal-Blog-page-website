"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, BookOpen, PenTool, Search } from "lucide-react";
import { checkIsAdminOrWriter } from "@/actions/posts";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();

  const navigation = [
    { name: "Articles", href: "/articles" },
    { name: "Christian Living", href: "/articles?category=christian-living" },
    { name: "Technology", href: "/articles?category=software-engineering" },
  ];

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (user) {
      checkIsAdminOrWriter().then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Chukwunonso's Blog
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-stone-50" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors duration-200 hover:text-neutral-900 dark:hover:text-neutral-50 ${
                  isActive(item.href)
                    ? "text-neutral-900 dark:text-neutral-50 underline decoration-stone-400 underline-offset-4"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            <Show when="signed-in">
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 text-xs font-semibold px-3  h-9 rounded-md border border-stone-200 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-all duration-200"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              )}
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                  },
                }}
              />
            </Show>

            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 px-4 py-2 h-9 flex items-center justify-center rounded-md text-xs font-medium transition-colors"
              >
                Subscribe
              </Link>
            </Show>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-stone-100 dark:hover:bg-neutral-900"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-950 px-6 py-4 space-y-3 transition-all">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-medium py-2 ${
                isActive(item.href)
                  ? "text-neutral-900 dark:text-neutral-50 font-semibold"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-stone-200 dark:border-neutral-800 flex flex-col gap-3">
            <Show when="signed-in">
              {isAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 text-sm font-medium w-full py-2.5 rounded-md border border-stone-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              <div className="flex justify-center py-2">
                <UserButton />
              </div>
            </Show>
            
            <Show when="signed-out">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-medium py-2.5 text-neutral-700 dark:text-neutral-300 border border-transparent rounded-md"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-medium py-2.5 bg-neutral-900 dark:bg-neutral-50 text-stone-50 dark:text-neutral-950 rounded-md"
              >
                Subscribe
              </Link>
            </Show>
          </div>
        </div>
      )}
    </header>
  );
}
export default Header;
