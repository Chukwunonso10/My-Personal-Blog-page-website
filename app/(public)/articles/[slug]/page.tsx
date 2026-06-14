import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MDXContent } from "@/components/editorial/mdx-content";
import { TableOfContents } from "@/components/editorial/table-of-contents";
import { ViewTracker } from "@/components/blog/view-tracker";
import { CommentsSection } from "@/components/blog/comments-section";
import { Clock, User, ArrowLeft, Eye, Calendar } from "lucide-react";

// Premium detailed mock articles database (MDX content)
const MOCK_ARTICLES: Record<string, any> = {
  "the-architecture-of-grace": {
    id: "mock-1",
    title: "The Architecture of Grace: Faith Meets Reason in the Modern Age",
    slug: "the-architecture-of-grace",
    excerpt: "An exploration of how theological foundations interface with human reason, arguing for a cohesive, synthesis of faith, logic, and spiritual renewal.",
    content: `
Grace is not merely a passive theological abstraction; it is the structural foundation of biblical truth. In an era dominated by empirical reductionism, the modern mind often views faith and intellect as binary opposites. However, historical Christian thought has always championed the harmony of faith (*fides*) and reason (*ratio*).

<Callout type="info" title="Scriptural Anchor">
  "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast." — Ephesians 2:8-9
</Callout>

## The Tension Between Logic and Mystery

A serious study of theology reveals that logic is a reflection of God's character—orderly, consistent, and true. Yet, reason alone cannot fully map the depths of the divine. Grace bridges the gap. It is the unmerited favor of God that illuminates the human mind, enabling it to grasp truths that transcend mathematical formulas or sociological models.

To build a timeless publishing platform or a robust worldview, we must reject the false dichotomy of intellectual rigor versus deep spiritual devotion.

### The Role of Sanctification in Thought

How does grace affect our daily habits and intellectual pursuits?
1. **Humility in Research**: Recognizing that all truth is God's truth (*omnis veritas est veritas Dei*).
2. **Commitment to Integrity**: Writing, designing, and coding with absolute honesty.
3. **Compassion in Argumentation**: Engaging with differing viewpoints in a spirit of gentleness.

## The Timelessness of True Devotion

As we reflect on these concepts, let us look at the early Church fathers who managed to write profound philosophical treaties while maintaining a deep, prayerful walk with Christ. Our goal is to replicate that depth on this platform.
    `,
    coverImage: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
    readingTime: 6,
    views: 412,
    publishedAt: new Date("2026-06-10T10:00:00Z"),
    author: { username: "Alexander Mercer", image: null },
    category: { name: "Christian Living", slug: "christian-living" }
  },
  "building-apis-nextjs-prisma": {
    id: "mock-2",
    title: "Building Production-Ready REST APIs with Next.js 16 and Prisma",
    slug: "building-apis-nextjs-prisma",
    excerpt: "A deep dive into serverless database connectivity, validation with Zod, and structure patterns for Next.js 16 API architectures.",
    content: `
In this tutorial, we will construct a production-ready REST API using **Next.js 16 App Router**, **TypeScript**, and **Prisma ORM**. When designing endpoints for high-performance publishing systems, security and query efficiency are paramount.

## Designing the Schema

Let's look at the database schema. In schema design, index planning is crucial to keep read times under 50ms. Here is how we define the post model:

\`\`\`prisma
model Post {
  id          String     @id @default(uuid())
  title       String
  slug        String     @unique
  excerpt     String     @db.Text
  content     String     @db.Text
  views       Int        @default(0)
  createdAt   DateTime   @default(now())

  @@index([slug])
}
\`\`\`

<Callout type="warning" title="Prisma Hot Reload Warning">
  Always initialize your Prisma Client as a singleton in serverless environments like Next.js dev server. Neglecting this will exhaust connection limits in seconds.
</Callout>

## Implementing Server Actions

Server Actions in Next.js 16 provide a seamless way to trigger backend operations without spinning up full HTTP endpoints. Here is a simple Server Action to create a subscriber:

\`\`\`typescript
"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function addSubscriber(formData: FormData) {
  const email = formData.get("email") as string;
  const parsed = schema.safeParse({ email });
  
  if (!parsed.success) {
    return { error: "Invalid Email" };
  }

  await prisma.newsletterSubscriber.create({
    data: { email: email.toLowerCase() }
  });

  return { success: true };
}
\`\`\`

## Performance Tuning

When working with PostgreSQL, use indexes appropriately. For lookups on slug columns, an index is mandatory:
- Query optimization prevents full table scans.
- Enable connection pooling on Supabase for serverless functions using port 6543 (PgBouncer).
- Use dynamic ISR caching to revalidate static pages when new entries are published.
    `,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    readingTime: 8,
    views: 389,
    publishedAt: new Date("2026-06-12T09:15:00Z"),
    author: { username: "Devon Sinclair", image: null },
    category: { name: "APIs", slug: "apis" }
  },
  "pauline-theology-romans": {
    id: "mock-3",
    title: "Pauline Theology: Exploring Justification by Faith in Romans",
    slug: "pauline-theology-romans",
    excerpt: "A systematic study of Paul's letters to the Romans, analyzing historical context, justification, and practical Christian duties.",
    content: `
Justification by faith is the cornerstone of Pauline theology, particularly articulated in the Epistle to the Romans. Understanding this doctrine requires analyzing both its historical context and its theological structure.

## Historical and Theological Context

In the first century, the relationship between Jewish law and the inclusion of Gentile believers was a source of significant debate. Paul argued that righteousness before God does not come from works of the law but through faith in Jesus Christ.

<Callout type="info" title="Romans 1:16-17">
  "For I am not ashamed of the gospel, for it is the power of God for salvation to everyone who believes, to the Jew first and also to the Greek."
</Callout>

### Key Concepts in Pauline Epistles

1. **Grace (*Charis*)**: God's unmerited favor toward humans, who are incapable of earning salvation.
2. **Righteousness (*Dikaiosyne*)**: Declared righteous forensically and covenantally before God.
3. **Faith (*Pistis*)**: Trust, allegiance, and belief in the saving work of Christ.

## Practical Duties of the Christian

Paul does not divorce theology from action. In Romans 12, he outlines how the justified believer should live:
- Presenting one's body as a living sacrifice.
- Renewing the mind to discern God's will.
- Exercising spiritual gifts in humility.
    `,
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
    readingTime: 12,
    views: 295,
    publishedAt: new Date("2026-06-08T08:00:00Z"),
    author: { username: "Alexander Mercer", image: null },
    category: { name: "Bible Study", slug: "bible-study" }
  },
  "react-19-state-management": {
    id: "mock-4",
    title: "State Management in React 19: Beyond useEffect Hooks",
    slug: "react-19-state-management",
    excerpt: "Analyzing React 19 server actions, useActionState, and local optimization paradigms to eliminate unnecessary client-side lifecycle hook usage.",
    content: `
React 19 introduces a paradigm shift in how we handle state, especially regarding async data mutations. The days of relying heavily on \`useEffect\` and manual loading state tracking are coming to an end.

## The Problem with useEffect

Historically, developers used \`useEffect\` hooks to trigger fetches, sync data, and manage load indicators. This often led to race conditions, complex error handling, and bloated client-side code.

\`\`\`typescript
// The old, imperative way
useEffect(() => {
  let isMounted = true;
  setLoading(true);
  fetchData().then((res) => {
    if (isMounted) {
      setData(res);
      setLoading(false);
    }
  });
  return () => { isMounted = false; };
}, []);
\`\`\`

## React 19 Actions

With React 19, async transitions are first-class citizens. Functions passed to form actions automatically manage loading state for you.

### useActionState Hook

The new \`useActionState\` hook handles form submissions and action lifecycle seamlessly:

\`\`\`typescript
import { useActionState } from 'react';

async function updateProfile(prevState, queryData) {
  try {
    await api.save(queryData);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

const [state, formAction, isPending] = useActionState(updateProfile, null);
\`\`\`

- **isPending** automatically switches to true while the async function runs.
- **state** holds the return value of the action.
- Works natively with React Server Components.
    `,
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    readingTime: 7,
    views: 184,
    publishedAt: new Date("2026-06-11T14:30:00Z"),
    author: { username: "Devon Sinclair", image: null },
    category: { name: "Software Engineering", slug: "software-engineering" }
  }
};

interface Props {
  params: Promise<{ slug: string }>;
}

// Dynamic Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let post = null;

  try {
    post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true },
    });
  } catch (err) {
    // Ignore db err
  }

  const article = post || MOCK_ARTICLES[slug];
  if (!article) return { title: "Article Not Found" };

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/articles/${article.slug}`;

  return {
    title: `${article.title} | Aletheia`,
    description: article.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.coverImage ? [{ url: article.coverImage }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let post = null;
  let relatedPosts: any[] = [];

  try {
    post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { username: true, image: true } },
        category: { select: { name: true, slug: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { username: true, image: true } } },
        },
      },
    });

    if (post) {
      relatedPosts = await prisma.post.findMany({
        where: {
          categoryId: post.categoryId,
          status: "PUBLISHED",
          id: { not: post.id },
        },
        take: 2,
        include: {
          author: { select: { username: true } },
          category: { select: { name: true, slug: true } },
        },
      });
    }
  } catch (err) {
    console.warn("Prisma failed fetching article, falling back to mock database.", err);
  }

  // Load fallback article if DB is empty
  const article = post || MOCK_ARTICLES[slug];
  if (!article) {
    notFound();
  }

  // Related posts fallback
  const finalRelated = relatedPosts.length > 0 
    ? relatedPosts 
    : Object.values(MOCK_ARTICLES).filter((p) => p.slug !== slug).slice(0, 2);

  // JSON-LD structured data payload
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.coverImage || "/og-fallback.png",
    "datePublished": article.publishedAt?.toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author.username || "Staff Writer",
    },
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker slug={slug} />

      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-10 lg:py-16">
        {/* Back Link */}
        <div className="mb-10">
          <Link
            href="/articles"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Archive</span>
          </Link>
        </div>

        {/* Layout: Content Column & Sticky TOC Column */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          <article className="lg:col-span-8 space-y-8">
            {/* Meta header */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {article.category?.name}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
                {article.title}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 italic text-md leading-relaxed">
                {article.excerpt}
              </p>

              {/* Author Banner */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400 pt-4 border-y border-stone-200/60 dark:border-neutral-800/60 py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-neutral-800 flex items-center justify-center font-semibold text-neutral-500 text-[10px]">
                    {article.author?.image ? (
                      <img src={article.author.image} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      (article.author?.username || "Staff Writer").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {article.author?.username || "Staff Writer"}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Draft"}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readingTime} min read</span>
                </div>
                <div className="flex items-center space-x-1.5 ml-auto">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{article.views} views</span>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            {article.coverImage && (
              <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-900 shadow-sm">
                <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Rich Content rendering */}
            <div className="pt-4 font-editorial-sans">
              <MDXContent source={article.content} />
            </div>

            {/* Comments Thread */}
            <CommentsSection
              postId={article.id}
              postSlug={article.slug}
              initialComments={article.comments || []}
            />
          </article>

          {/* Sticky Sidebar: TOC & Related Posts */}
          <aside className="lg:col-span-4 lg:pl-6 space-y-12">
            <TableOfContents />

            {/* Related Posts */}
            <div className="space-y-4 pt-6 border-t border-stone-200/80 dark:border-neutral-800/80">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50 mb-2">
                Related Reading
              </h3>
              <div className="space-y-4">
                {finalRelated.map((rel) => (
                  <div key={rel.slug} className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                      {rel.category?.name}
                    </span>
                    <h4 className="font-serif text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-200 hover:underline">
                      <Link href={`/articles/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {rel.readingTime} min read
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
