import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { BackButton } from "@/components/back-button";

export default async function TemplatesPage() {
  const templates = await prisma.site.findMany({
    where: {
      isTemplate: true,
    },
    select: {
      id: true,
      name: true,
      subdomain: true,
      customDomain: true,
      templateCategory: true,
      templateDescription: true,
      thumbnailUrl: true,
    },
    orderBy: {
      templateCategory: "asc",
    },
  });

  // Group by category
  const groupedTemplates = templates.reduce(
    (acc, template) => {
      const category = template.templateCategory || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    },
    {} as Record<string, typeof templates>,
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Template</h1>
        <p className="text-lg text-muted-foreground">
          Start with a professionally designed template and customize it to
          match your brand
        </p>
      </div>

      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 capitalize">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTemplates.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {template.thumbnailUrl && (
                  <div className="relative aspect-video">
                    <Image
                      src={template.thumbnailUrl}
                      alt={template.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{template.name}</CardTitle>
                    <Badge variant="secondary">
                      {template.templateCategory}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.templateDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/app/sites/new?template=${template.id}`}>
                      Use Template
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href={`http://${template.subdomain}.localhost:3000`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
