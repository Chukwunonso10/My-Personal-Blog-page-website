"use client";

import { useEffect } from "react";
import { incrementPostViews } from "@/actions/posts";

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = `viewed-post-${slug}`;
      const alreadyViewed = sessionStorage.getItem(storageKey);
      
      if (!alreadyViewed) {
        incrementPostViews(slug);
        sessionStorage.setItem(storageKey, "true");
      }
    }
  }, [slug]);

  return null;
}
export default ViewTracker;
