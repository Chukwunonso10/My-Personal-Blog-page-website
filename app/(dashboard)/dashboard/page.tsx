import React from "react";
import { prisma } from "@/lib/db";
import { Eye, FileText, FileEdit, Users, Award, TrendingUp } from "lucide-react";

// Mock analytics details
const MOCK_ANALYTICS = {
  totalViews: 1280,
  publishedCount: 4,
  draftsCount: 2,
  subscribersCount: 84,
  topPosts: [
    { id: "mock-1", title: "The Architecture of Grace: Faith Meets Reason", views: 412, status: "PUBLISHED" },
    { id: "mock-2", title: "Building Production-Ready REST APIs with Next.js 16 and Prisma", views: 389, status: "PUBLISHED" },
    { id: "mock-3", title: "Pauline Theology: Exploring Justification by Faith", views: 295, status: "PUBLISHED" },
    { id: "mock-4", title: "State Management in React 19: Beyond useEffect Hooks", views: 184, status: "PUBLISHED" },
  ]
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats = {
    totalViews: 0,
    publishedCount: 0,
    draftsCount: 0,
    subscribersCount: 0,
    topPosts: [] as any[],
  };

  let dbSuccess = false;

  try {
    const [posts, subscribers] = await Promise.all([
      prisma.post.findMany({
        orderBy: { views: "desc" },
        select: { id: true, title: true, views: true, status: true },
      }) as Promise<Array<{ id: string; title: string; views: number; status: "DRAFT" | "PUBLISHED" }>>,
      prisma.newsletterSubscriber.count(),
    ]);

    stats.totalViews = posts.reduce((sum: number, p: { views: number }) => sum + p.views, 0);
    stats.publishedCount = posts.filter((p: { status: string }) => p.status === "PUBLISHED").length;
    stats.draftsCount = posts.filter((p: { status: string }) => p.status === "DRAFT").length;
    stats.subscribersCount = subscribers;
    stats.topPosts = posts.slice(0, 5);
    dbSuccess = true;
  } catch (err) {
    console.warn("DB offline during analytics load, using mock stats.");
  }

  const finalStats = dbSuccess ? stats : MOCK_ANALYTICS;

  const cardData = [
    { name: "Total Views", value: finalStats.totalViews, icon: Eye, color: "text-blue-500" },
    { name: "Published Articles", value: finalStats.publishedCount, icon: FileText, color: "text-green-500" },
    { name: "Drafts", value: finalStats.draftsCount, icon: FileEdit, color: "text-amber-500" },
    { name: "Newsletter Subscribers", value: finalStats.subscribersCount, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Studio Overview
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {!dbSuccess && "Running in Sandbox/Mock Mode (Database Offline)"}
          {dbSuccess && "Live platform performance metrics."}
        </p>
      </div>


      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="bg-white border border-stone-200/80 rounded-lg p-6 dark:border-neutral-900 dark:bg-neutral-900/10 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-medium text-neutral-400">{card.name}</span>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-2.5 rounded bg-stone-50 dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Performing Articles */}
      <div className="bg-white border border-stone-200/80 rounded-lg dark:border-neutral-900 dark:bg-neutral-900/10 p-6 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-neutral-900 pb-4 mb-6">
          <TrendingUp className="w-4 h-4 text-neutral-400" />
          <h2 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Top Performing Publications
          </h2>
        </div>
        <div className="space-y-4">
          {finalStats.topPosts.length === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-6">
              Write and publish posts to see performance statistics.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-xs text-neutral-400 border-b border-stone-100 dark:border-neutral-900 pb-2">
                    <th className="py-2.5 font-medium">Article Title</th>
                    <th className="py-2.5 font-medium text-center">Status</th>
                    <th className="py-2.5 font-medium text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-neutral-900">
                  {finalStats.topPosts.map((post: any) => (
                    <tr key={post.id} className="text-neutral-700 dark:text-neutral-300">
                      <td className="py-3.5 font-medium truncate max-w-xs sm:max-w-md">
                        {post.title}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${post.status === "PUBLISHED"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-xs">
                        {post.views.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
