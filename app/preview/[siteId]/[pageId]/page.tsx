import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { registry } from "@/lib/registry";

interface PreviewPageProps {
  params: Promise<{
    siteId: string;
    pageId: string;
  }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { siteId, pageId } = await params;

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { site: true },
  });

  if (!page || page.siteId !== siteId) {
    notFound();
  }

  const content = Array.isArray(page.draftContent) ? page.draftContent : [];

  return (
    <div className="min-h-screen">
      {/* Preview Mode Banner */}
      <div className="sticky top-0 z-50 border-b bg-yellow-50 px-4 py-2 text-center">
        <Badge variant="outline" className="border-yellow-400 bg-yellow-100 text-yellow-800">
          Preview Mode - Viewing draft version
        </Badge>
      </div>

      {/* Render Page Content */}
      <div className="mx-auto">
        {content.map((component: any, index: number) => {
          const Component = registry[component.type as keyof typeof registry];
          if (!Component) {
            console.warn(`Component type "${component.type}" not found in registry`);
            return null;
          }
          return <Component key={index} {...component.props} />;
        })}
      </div>
    </div>
  );
}
