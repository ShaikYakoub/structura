"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

interface UpdateSiteData {
  name: string;
  description: string | null;
  content: any;
}

export async function updateSite(siteId: string, data: UpdateSiteData) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = (session.user as any).tenantId;

  // Verify site belongs to user's tenant
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });

  if (!site || site.tenantId !== tenantId) {
    throw new Error("Site not found");
  }

  // Update site
  await prisma.site.update({
    where: { id: siteId },
    data: {
      name: data.name,
      description: data.description,
      content: data.content,
      updatedAt: new Date(),
    },
  });

  // Revalidate paths
  revalidatePath("/app");
  revalidatePath(`/app/site/${siteId}`);
  revalidatePath(`/site/${site.subdomain}`);
}
