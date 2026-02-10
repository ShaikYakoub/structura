"use client";

interface ContentBlockProps {
  data: {
    content: string;
    className?: string;
  };
}

export function ContentBlock({ data }: ContentBlockProps) {
  const { content, className = "" } = data;

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div
          className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
