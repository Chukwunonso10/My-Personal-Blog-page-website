"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  // Extract text content from children React node
  const textContent = React.Children.toArray(children)
    .map((child) => (typeof child === "string" ? child : ""))
    .join("");

  const language = className?.replace(/language-/, "") || "text";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textContent.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 overflow-hidden rounded-md border border-stone-200 dark:border-neutral-800 bg-stone-100/50 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200/60 dark:border-neutral-800/60 bg-stone-200/20 dark:bg-neutral-900/40 text-xs text-neutral-500 font-mono">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-neutral-800 dark:text-neutral-200">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
export default CodeBlock;
