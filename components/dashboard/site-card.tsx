"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSite } from "@/app/actions/user";
import { Trash2 } from "lucide-react";

interface Site {
  id: string;
  name: string;
  subdomain: string;
  description?: string | null;
  _count: {
    pages: number;
  };
}

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSite(site.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to delete site");
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      alert("Failed to delete site");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{site.name}</CardTitle>
        <CardDescription>{site.subdomain}.localhost:3000</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {site.description && (
          <p className="text-sm text-gray-600">{site.description}</p>
        )}
        <div className="text-sm text-gray-500">
          {site._count.pages} page{site._count.pages !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <Link href={`/app/site/${site.id}`}>
            <Button size="sm">Edit</Button>
          </Link>
          <a
            href={`http://${site.subdomain}.localhost:3000`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline">
              View
            </Button>
          </a>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="backdrop-blur-md bg-white/80 border border-white/20 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Site</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{site.name}"? This action
                  cannot be undone and will permanently delete the site and all
                  its pages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
