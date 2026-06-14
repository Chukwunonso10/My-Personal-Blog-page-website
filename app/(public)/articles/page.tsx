import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SearchInput } from "@/components/blog/search-input";
import { BookOpen, User, Tag } from "lucide-react";

// Premium mock data fallback
const MOCK_POSTS = [
  {
    id: "mock-1",
    title: "The Architecture of Grace: Faith Meets Reason in the Modern Age",
    slug: "the-architecture-of-grace",
    excerpt: "An exploration of how theological foundations interface with human reason, arguing for a cohesive, timeless synthesis of faith, logic, and spiritual renewal.",
    coverImage: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
    readingTime: 6,
    publishedAt: new Date("2026-06-10T10:00:00Z"),
    author: { username: "Alexander Mercer" },
    category: { name: "Christian Living", slug: "christian-living" },
    tags: [{ name: "Grace", slug: "grace" }, { name: "Faith", slug: "faith" }]
  },
  {
    id: "mock-2",
    title: "Building Production-Ready REST APIs with Next.js 16 and Prisma",
    slug: "building-apis-nextjs-prisma",
    excerpt: "A deep dive into serverless database connectivity, validation with Zod, and structure patterns for Next.js 16 API architectures.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    readingTime: 8,
    publishedAt: new Date("2026-06-12T09:15:00Z"),
    author: { username: "Devon Sinclair" },
    category: { name: "APIs", slug: "apis" },
    tags: [{ name: "API Design", slug: "api-design" }, { name: "PostgreSQL", slug: "postgresql" }]
  },
  {
    id: "mock-3",
    title: "Pauline Theology: Exploring Justification by Faith in Romans",
    slug: "pauline-theology-romans",
    excerpt: "A systematic study of Paul's letters to the Romans, analyzing historical context, justification, and practical Christian duties.",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
    readingTime: 12,
    publishedAt: new Date("2026-06-08T08:00:00Z"),
    author: { username: "Alexander Mercer" },
    category: { name: "Bible Study", slug: "bible-study" },
    tags: [{ name: "Faith", slug: "faith" }, { name: "Spiritual Growth", slug: "spiritual-growth" }]
  },
  {
    id: "mock-4",
    title: "State Management in React 19: Beyond useEffect Hooks",
    slug: "react-19-state-management",
    excerpt: "Analyzing React 19 server actions, useActionState, and local optimization paradigms to eliminate unnecessary client-side lifecycle hook usage.",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    readingTime: 7,
    publishedAt: new Date("2026-06-11T14:30:00Z"),
    author: { username: "Devon Sinclair" },
    category: { name: "Software Engineering", slug: "software-engineering" },
    tags: [{ name: "React", slug: "react" }, { name: "TypeScript", slug: "typescript" }]
  }
];

const MOCK_CATEGORIES = [
  { name: "Christian Living", slug: "christian-living" },
  { name: "Bible Study", slug: "bible-study" },
  { name: "Devotional", slug: "devotional" },
  { name: "Software Engineering", slug: "software-engineering" },
  { name: "APIs", slug: "apis" },
  { name: "Web Development", slug: "web-development" },
  { name: "Career", slug: "career" }
];

const MOCK_TAGS = [
  { name: "Grace", slug: "grace" },
  { name: "Faith", slug: "faith" },
  { name: "Next.js", slug: "nextjs" },
  { name: "React", slug: "react" },
  { name: "TypeScript", slug: "typescript" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "API Design", slug: "api-design" },
  { name: "Spiritual Growth", slug: "spiritual-growth" }
];

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search || "";
  const activeCategory = resolvedParams.category || "";
  const activeTag = resolvedParams.tag || "";
  const currentPage = parseInt(resolvedParams.page || "1", 10);
  const itemsPerPage = 6;

  let dbPosts: any[] = [];
  let dbCategories: { id: string; name: string; slug: string }[] = [];
  let dbTags: { id: string; name: string; slug: string }[] = [];

  try {
    // Attempt DB fetch
    dbCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    dbTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    
    // Construct Prisma where clause
    const where: any = { status: "PUBLISHED" };
    
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { excerpt: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }
    
    if (activeCategory) {
      where.category = { slug: activeCategory };
    }
    
    if (activeTag) {
      where.tags = { some: { slug: activeTag } };
    }

    dbPosts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true } },
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true, slug: true } },
      },
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
    });
  } catch (err) {
    console.warn("Prisma query failed, using mocked filtration.", err);
  }

  // Fallback to mock data filter
  const categories = dbCategories.length > 0 ? dbCategories : MOCK_CATEGORIES;
  const tags = dbTags.length > 0 ? dbTags : MOCK_TAGS;
  
  let posts = dbPosts;
  if (posts.length === 0 && !searchQuery && !activeCategory && !activeTag) {
    posts = MOCK_POSTS;
  } else if (posts.length === 0) {
    // If user filtered but DB returned 0, filter mock posts to make the app feel alive
    posts = MOCK_POSTS.filter((post) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(query);
        if (!matchesTitle && !matchesExcerpt) return false;
      }
      if (activeCategory && post.category.slug !== activeCategory) {
        return false;
      }
      if (activeTag && !post.tags.some((t) => t.slug === activeTag)) {
        return false;
      }
      return true;
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 py-12 lg:py-16">
      <div className="space-y-2 mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          The Archive
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm leading-relaxed">
          Filter through devotional insights, biblical studies, and engineering guidelines.
        </p>
      </div>

      {/* Control Bar: Search & Category Chips */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-stone-200 dark:border-neutral-800 pb-8 mb-12">
        <SearchInput defaultValue={searchQuery} />
        
        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Link
            href="/articles"
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              !activeCategory
                ? "bg-neutral-900 text-white dark:bg-stone-50 dark:text-neutral-950"
                : "bg-stone-100 hover:bg-stone-200 text-neutral-600 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/articles?category=${cat.slug}${searchQuery ? `&search=${searchQuery}` : ""}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                activeCategory === cat.slug
                  ? "bg-neutral-900 text-white dark:bg-stone-50 dark:text-neutral-950"
                  : "bg-stone-100 hover:bg-stone-200 text-neutral-600 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 items-start">
        {/* Left Side: Tags Column */}
        <div className="lg:col-span-1 space-y-6 hidden lg:block">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Filter by Tag</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/articles?tag=${tag.slug}${activeCategory ? `&category=${activeCategory}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    activeTag === tag.slug
                      ? "bg-neutral-900 border-neutral-900 text-white dark:bg-stone-50 dark:border-stone-50 dark:text-neutral-950"
                      : "border-stone-200 hover:border-stone-400 text-neutral-500 hover:text-neutral-800 dark:border-neutral-800 dark:hover:border-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  #{tag.name}
                </Link>
              ))}
              {activeTag && (
                <Link
                  href={`/articles?${activeCategory ? `category=${activeCategory}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                  className="px-2.5 py-1 text-xs rounded border border-dashed border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                >
                  Clear Tag
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Articles Grid */}
        <div className="lg:col-span-3 space-y-12">
          {posts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-200 dark:border-neutral-800 rounded-lg">
              <BookOpen className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No publications found matching your selection.
              </p>
              <Link href="/articles" className="text-xs font-semibold text-neutral-900 dark:text-neutral-50 hover:underline mt-2 inline-block">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-lg border border-stone-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900/10 p-5 hover:shadow-sm transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="aspect-[16/10] overflow-hidden rounded bg-stone-50 dark:bg-neutral-900 border border-stone-200/60 dark:border-neutral-800/60">
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
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {post.category.name}
                      </span>
                      <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50 hover:underline leading-snug">
                        <Link href={`/articles/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-5 mt-5 border-t border-stone-100 dark:border-neutral-900">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author.username || "Staff Writer"}
                    </span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
