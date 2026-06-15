import { MDXRemote } from "next-mdx-remote/rsc";
import CodeBlock from "./code-block";
import Callout from "./callout";
import YouTubeEmbed from "./youtube-embed";
import React from "react";

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl sm:text-4xl font-serif font-bold mt-10 mb-4 tracking-tight text-neutral-900 dark:text-neutral-50"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl sm:text-3xl font-serif font-semibold mt-8 mb-4 tracking-tight text-neutral-800 dark:text-neutral-100 border-b border-stone-200/50 dark:border-neutral-800/50 pb-2"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl sm:text-2xl font-serif font-medium mt-6 mb-3 tracking-tight text-neutral-800 dark:text-neutral-100"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="leading-relaxed font-sans text-neutral-700 dark:text-neutral-300 mb-6 text-[1.125rem]"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-stone-300 dark:border-neutral-700 pl-6 italic my-8 text-neutral-600 dark:text-neutral-400 text-lg font-serif"
      {...props}
    />
  ),
  pre: (props: any) => <div className="my-6" {...props} />,
  code: (props: any) => {
    // If it is an inline code tag, render it simply
    const isInline = typeof props.children === "string" && !props.children.includes("\n");
    if (isInline) {
      return (
        <code
          className="bg-stone-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200 text-sm font-mono"
          {...props}
        />
      );
    }
    return <CodeBlock {...props} />;
  },
  Callout,
  Callback: Callout,
  YouTubeEmbed,
};

interface MDXContentProps {
  source: string;
}

export function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
export default MDXContent;
