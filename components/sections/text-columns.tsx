"use client";

interface TextColumn {
  content: string;
}

interface TextColumnsProps {
  data: {
    layout?: string;
    columns: TextColumn[];
  };
}

export function TextColumns({ data }: TextColumnsProps) {
  const { layout = "2-col", columns } = data;

  const layoutClasses = {
    "2-col": "md:grid-cols-2",
    "3-col": "md:grid-cols-3",
    "1-2": "md:grid-cols-[1fr_2fr]", // Sidebar left
    "2-1": "md:grid-cols-[2fr_1fr]", // Sidebar right
  };

  const gridClass =
    layoutClasses[layout as keyof typeof layoutClasses] || "md:grid-cols-2";

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className={`grid grid-cols-1 ${gridClass} gap-8 md:gap-12`}>
          {columns.map((column, index) => (
            <div
              key={index}
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: column.content }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
