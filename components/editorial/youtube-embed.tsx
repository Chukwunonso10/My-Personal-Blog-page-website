import React from "react";

interface YouTubeEmbedProps {
  id: string;
  title?: string;
}

export function YouTubeEmbed({ id, title = "YouTube Video" }: YouTubeEmbedProps) {
  return (
    <div className="relative my-8 aspect-video overflow-hidden rounded-md border border-stone-200 dark:border-neutral-800 shadow-sm">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
export default YouTubeEmbed;
