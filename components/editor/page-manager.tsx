"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Home, FileText, Trash2 } from "lucide-react";
import {
  createPage,
  getSitePages,
  deletePage,
} from "@/lib/actions/pages";
import { toast } from "sonner";
import type { Page } from "@prisma/client";

interface PageManagerProps {
  siteId: string;
  currentPageId: string | null;
  onPageChange: (page: Page) => void;
}

export function PageManager({
  siteId,
  currentPageId,
  onPageChange,
}: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const loadPages = async () => {
    try {
      const sitePages = await getSitePages(siteId);
      setPages(sitePages);

      // If no current page, select the first one (home page)
      if (!currentPageId && sitePages.length > 0) {
        onPageChange(sitePages[0]);
      }
    } catch (error) {
      console.error("Failed to load pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [siteId]);

  const handleNameChange = (name: string) => {
    setNewPageName(name);
    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setNewPageSlug(slug);
  };

  const handleCreatePage = async () => {
    if (!newPageName.trim()) {
      toast.error("Page name is required");
      return;
    }

    if (!newPageSlug.trim()) {
      toast.error("Page slug is required");
      return;
    }

    setCreating(true);
    try {
      const page = await createPage(siteId, newPageName, newPageSlug);
      toast.success(`Page "${newPageName}" created!`);
      setPages([...pages, page]);
      onPageChange(page);
      setCreateDialogOpen(false);
      setNewPageName("");
      setNewPageSlug("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create page");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }

    try {
      await deletePage(pageId);
      toast.success("Page deleted");
      const updatedPages = pages.filter((p) => p.id !== pageId);
      setPages(updatedPages);

      // Switch to home page if deleted current page
      if (pageId === currentPageId && updatedPages.length > 0) {
        onPageChange(updatedPages[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete page");
    }
  };

  const currentPage = pages.find((p) => p.id === currentPageId);

  return (
    <div className="flex items-center gap-4">
      {/* Page Selector */}
      <Select
        value={currentPageId || undefined}
        onValueChange={(pageId) => {
          const page = pages.find((p) => p.id === pageId);
          if (page) onPageChange(page);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a page">
            {currentPage && (
              <div className="flex items-center gap-2">
                {currentPage.isHomePage ? (
                  <Home className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{currentPage.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {pages.map((page) => (
            <SelectItem key={page.id} value={page.id}>
              <div className="flex items-center gap-2">
                {page.isHomePage ? (
                  <Home className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{page.name}</span>
                {!page.isPublished && (
                  <span className="text-xs text-gray-500">(Draft)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Create New Page Button */}
      <Button
        onClick={() => setCreateDialogOpen(true)}
        size="sm"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-1" />
        New Page
      </Button>

      {/* Delete Current Page (if not home) */}
      {currentPage && !currentPage.isHomePage && (
        <Button
          onClick={() => handleDeletePage(currentPage.id)}
          size="sm"
          variant="ghost"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      {/* Create Page Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Add a new page to your website
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-name">Page Name</Label>
              <Input
                id="page-name"
                placeholder="About Us"
                value={newPageName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/</span>
                <Input
                  id="page-slug"
                  placeholder="about-us"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePage} disabled={creating}>
              {creating ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
