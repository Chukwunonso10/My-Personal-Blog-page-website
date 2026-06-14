"use client";

import React, { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Find headings inside the article body
    const articleElement = document.querySelector("article");
    if (!articleElement) return;

    const headingElements = articleElement.querySelectorAll("h2, h3");
    const items: TOCItem[] = Array.from(headingElements).map((el) => {
      // Ensure heading has a valid ID for anchor links
      if (!el.id) {
        const text = el.textContent || "";
        el.id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return {
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      };
    });

    setHeadings(items);

    // Track active heading using IntersectionObserver
    const callback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort visible headings to find the one closest to the top viewport margin
        const sorted = visibleEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        );
        setActiveId(sorted[0].target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -40% 0px",
    });

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-3 hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50 mb-3">
        On this page
      </h3>
      <ul className="space-y-2.5 text-xs">
        {headings.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                setActiveId(item.id);
              }}
              className={`block transition-colors py-0.5 border-l pl-3 -ml-px ${
                activeId === item.id
                  ? "border-neutral-900 text-neutral-900 font-medium dark:border-neutral-50 dark:text-neutral-50"
                  : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
export default TableOfContents;
