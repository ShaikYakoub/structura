import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const subdomainSchema = z
  .string()
  .min(3, "Subdomain must be at least 3 characters")
  .max(63, "Subdomain must be less than 63 characters")
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    "Subdomain must be alphanumeric and can contain hyphens"
  );

const customDomainSchema = z
  .string()
  .regex(
    /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/,
    "Invalid domain format"
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const body = await req.json();
    const { subdomain, customDomain } = body;

    // Validate subdomain if provided
    if (subdomain !== undefined) {
      const validatedSubdomain = subdomainSchema.parse(subdomain);

      // Check if subdomain is already taken
      const existing = await prisma.site.findFirst({
        where: {
          subdomain: validatedSubdomain,
          NOT: { id: params.siteId },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Subdomain is already taken" },
          { status: 409 }
        );
      }
    }

    // Validate custom domain if provided
    if (customDomain !== undefined && customDomain !== null && customDomain !== "") {
      // Normalize domain (remove www, https, etc.)
      let normalizedDomain = customDomain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "")
        .toLowerCase();

      const validatedDomain = customDomainSchema.parse(normalizedDomain);

      // Check if custom domain is already taken
      const existing = await prisma.site.findFirst({
        where: {
          customDomain: validatedDomain,
          NOT: { id: params.siteId },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Custom domain is already in use" },
          { status: 409 }
        );
      }
    }

    // Update site
    const updatedSite = await prisma.site.update({
      where: { id: params.siteId },
      data: {
        ...(subdomain !== undefined && { subdomain }),
        ...(customDomain !== undefined && {
          customDomain: customDomain || null,
        }),
      },
    });

    return NextResponse.json(updatedSite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating domain:", error);
    return NextResponse.json(
      { error: "Failed to update domain settings" },
      { status: 500 }
    );
  }
}
