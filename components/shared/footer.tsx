"use client";

import React, { useState } from "react";
import Link from "next/link";
import { subscribeNewsletter } from "@/actions/newsletter";
import { ArrowRight, Loader2, BookOpen } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setStatus(null);
    
    const formData = new FormData();
    formData.append("email", email);

    try {
      const res = await subscribeNewsletter(formData);
      setStatus(res);
      if (res.success) {
        setEmail("");
      }
    } catch (err) {
      setStatus({ success: false, message: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-stone-100/30 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/20 py-16 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Chukwunonso's Blog
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-stone-50" />
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              A premium personal publishing platform exploring Christian teachings, theological devotionals, and software engineering architecture.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-1">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50">
                Publications
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/articles?category=christian-living" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
                    Christian Living
                  </Link>
                </li>
                <li>
                  <Link href="/articles?category=bible-study" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
                    Bible Study
                  </Link>
                </li>
                <li>
                  <Link href="/articles?category=devotional" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
                    Devotionals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50">
                Technology
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/articles?category=software-engineering" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
                    Engineering
                  </Link>
                </li>
                <li>
                  <Link href="/articles?category=apis" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
                    API Dev
                  </Link>
                </li>
                <li>
                  <Link href="/articles?category=web-development" className="hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
                    Web Tech
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50">
              Subscribe to the Newsletter
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Get notified of new studies, essays, and software architecture write-ups.
            </p>
            <form onSubmit={handleSubmit} className="flex max-w-md gap-x-2">
              <label htmlFor="footer-email-address" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email-address"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-auto rounded-md border border-stone-200 bg-white px-3.5 py-2 text-sm shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:ring-neutral-800 dark:placeholder:text-neutral-500 dark:focus:ring-stone-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex-none rounded-md bg-neutral-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 flex items-center justify-center min-w-[40px] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>
            {status && (
              <p className={`text-xs ${status.success ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {status.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-400">
          <p>© {currentYear} Chukwunonso's Blog Publishing. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-neutral-600 dark:hover:text-neutral-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-600 dark:hover:text-neutral-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
