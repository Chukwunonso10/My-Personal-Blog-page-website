"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = new FormData(e.currentTarget).get("q") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset page when query changes

    startTransition(() => {
      router.push(`/articles?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles..."
        className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-stone-50 transition-colors"
      />
      <div className="absolute left-3.5 top-2.5 text-neutral-400">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-neutral-600 dark:text-neutral-300" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>
    </form>
  );
}
export default SearchInput;
