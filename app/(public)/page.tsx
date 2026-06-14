import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowRight, Clock, BookOpen, User } from "lucide-react";

// Premium fallback data for when database is empty/offline
const MOCK_POSTS = [
  {
    id: "mock-1",
    title: "The Architecture of Grace: Faith Meets Reason in the Modern Age",
    slug: "the-architecture-of-grace",
    excerpt: "An exploration of how theological foundations interface with human reason, arguing for a cohesive, timeless synthesis of faith, logic, and spiritual renewal.",
    coverImage: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
    readingTime: 6,
    views: 412,
    featured: true,
    publishedAt: new Date("2026-06-10T10:00:00Z"),
    author: { username: "Alexander Mercer", image: null },
    category: { name: "Christian Living", slug: "christian-living" }
  },
  {
    id: "mock-2",
    title: "Building Production-Ready REST APIs with Next.js 16 and Prisma",
    slug: "building-apis-nextjs-prisma",
    excerpt: "A deep dive into serverless database connectivity, validation with Zod, and structure patterns for Next.js 16 API architectures.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    readingTime: 8,
    views: 389,
    featured: false,
    publishedAt: new Date("2026-06-12T09:15:00Z"),
    author: { username: "Devon Sinclair", image: null },
    category: { name: "APIs", slug: "apis" }
  },
  {
    id: "mock-3",
    title: "Pauline Theology: Exploring Justification by Faith in Romans",
    slug: "pauline-theology-romans",
    excerpt: "A systematic study of Paul's letters to the Romans, analyzing historical context, justification, and practical Christian duties.",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
    readingTime: 12,
    views: 295,
    featured: false,
    publishedAt: new Date("2026-06-08T08:00:00Z"),
    author: { username: "Alexander Mercer", image: null },
    category: { name: "Bible Study", slug: "bible-study" }
  },
  {
    id: "mock-4",
    title: "State Management in React 19: Beyond useEffect Hooks",
    slug: "react-19-state-management",
    excerpt: "Analyzing React 19 server actions, useActionState, and local optimization paradigms to eliminate unnecessary client-side lifecycle hook usage.",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    readingTime: 7,
    views: 184,
    featured: false,
    publishedAt: new Date("2026-06-11T14:30:00Z"),
    author: { username: "Devon Sinclair", image: null },
    category: { name: "Software Engineering", slug: "software-engineering" }
  }
];

export const revalidate = 3600; // Cache and ISR for 1 hour

export default async function HomePage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true, image: true } },
        category: { select: { name: true, slug: true } },
      },
    });
  } catch (err) {
    console.warn("Database lookup failed, falling back to mock posts.", err);
  }

  // If database has no posts, use premium mock posts
  const displayPosts = posts.length > 0 ? posts : MOCK_POSTS;

  const featuredPost = displayPosts.find((p) => p.featured) || displayPosts[0];
  const latestPosts = displayPosts.filter((p) => p.id !== featuredPost.id).slice(0, 3);
  const popularPosts = [...displayPosts].sort((a, b) => b.views - a.views).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 py-12 lg:py-16">
      {/* Featured Section */}
      {featuredPost && (
        <section className="mb-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-900">
              {featuredPost.coverImage ? (
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-400">
                  <BookOpen className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {featuredPost.category.name}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
                <Link href={`/articles/${featuredPost.slug}`} className="hover:underline">
                  {featuredPost.title}
                </Link>
              </h1>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-lg">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{featuredPost.author.username || "Staff Writer"}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featuredPost.readingTime} min read</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href={`/articles/${featuredPost.slug}`}
                  className="inline-flex items-center space-x-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50 hover:underline"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Latest & Popular Articles */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Latest Articles */}
        <div className="lg:col-span-8 space-y-12">
          <div className="border-b border-stone-200 dark:border-neutral-800 pb-4">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Latest Publications
            </h2>
          </div>
          <div className="space-y-12">
            {latestPosts.map((post) => (
              <article key={post.id} className="group grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="aspect-[16/10] overflow-hidden rounded bg-stone-100 dark:bg-neutral-900 border border-stone-200/60 dark:border-neutral-800/60">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-350 group-hover:scale-103"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {post.category.name}
                  </span>
                  <h3 className="font-serif text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:underline">
                    <Link href={`/articles/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-neutral-400 dark:text-neutral-500 pt-1">
                    <span>{post.author.username || "Staff Writer"}</span>
                    <span>•</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Popular Articles Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="border-b border-stone-200 dark:border-neutral-800 pb-4">
            <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Popular Essays
            </h2>
          </div>
          <div className="space-y-6">
            {popularPosts.map((post, idx) => (
              <div key={post.id} className="flex gap-4 items-start">
                <span className="font-serif text-3xl font-light text-neutral-300 dark:text-neutral-800 w-8 flex-shrink-0">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    {post.category.name}
                  </span>
                  <h4 className="font-serif text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 hover:underline">
                    <Link href={`/articles/${post.slug}`}>{post.title}</Link>
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-400 pt-0.5">
                    <span>{post.author.username || "Staff Writer"}</span>
                    <span>•</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
