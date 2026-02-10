import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { VisualEditor } from "@/components/visual-editor";

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: [
          { isHomePage: "desc" }, // Home page first
          { createdAt: "asc" },
        ],
      },
    },
  });

  if (!site || site.tenantId !== tenantId) {
    notFound();
  }

  // Get the first page (home page)
  const initialPage = site.pages[0] || null;

  return <VisualEditor site={site} initialPage={initialPage} />;
}
