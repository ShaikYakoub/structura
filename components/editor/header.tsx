"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2, Eye, Rocket } from "lucide-react";
import {
  publishSite,
  saveDraft,
  hasUnpublishedChanges,
} from "@/app/actions/publish";

interface Page {
  id: string;
  name: string;
  slug: string;
}

interface EditorHeaderProps {
  siteId: string;
  currentPageId: string;
  pages: Page[];
  onSave: () => Promise<any>;
  hasUnsavedChanges: boolean;
}

type SaveStatus = "saved" | "saving" | "unsaved";

export function EditorHeader({
  siteId,
  currentPageId,
  pages,
  onSave,
  hasUnsavedChanges,
}: EditorHeaderProps) {
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [hasChanges, setHasChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Check for unpublished changes
  useEffect(() => {
    const checkChanges = async () => {
      const changed = await hasUnpublishedChanges(currentPageId);
      setHasChanges(changed);
    };
    checkChanges();
  }, [currentPageId, saveStatus]);

  // Update save status based on unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      setSaveStatus("unsaved");
    }
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const content = await onSave();
      await saveDraft(currentPageId, content);
      setSaveStatus("saved");
      toast.success("Draft saved successfully");
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("unsaved");
      toast.error("Failed to save draft");
    }
  };

  const handlePreview = () => {
    window.open(`/preview/${siteId}/${currentPageId}`, "_blank");
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Save draft first if needed
      if (hasUnsavedChanges) {
        const content = await onSave();
        await saveDraft(currentPageId, content);
      }

      // Publish site
      const result = await publishSite(siteId);

      if (result.success) {
        // Celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Get site domain for live link
        const site = await fetch(`/api/sites/${siteId}`).then((r) => r.json());
        const liveUrl = site.customDomain
          ? `https://${site.customDomain}`
          : `https://${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}`;

        toast.success(
          <div>
            <p className="font-semibold">Site published successfully! 🎉</p>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View live site →
            </a>
          </div>,
          { duration: 5000 },
        );

        setSaveStatus("saved");
        setHasChanges(false);
      } else {
        toast.error("Failed to publish site");
      }
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("Failed to publish site");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePageChange = (pageId: string) => {
    router.push(`/app/site/${siteId}?page=${pageId}`);
  };

  const getSaveIcon = () => {
    switch (saveStatus) {
      case "saved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case "unsaved":
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSaveText = () => {
    switch (saveStatus) {
      case "saved":
        return "Saved";
      case "saving":
        return "Saving...";
      case "unsaved":
        return "Unsaved changes";
    }
  };

  return (
    <div className="border-b bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Page Switcher */}
        <Select value={currentPageId} onValueChange={handlePageChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                {page.name} {page.slug !== "/" && `(${page.slug})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Save Status */}
        <div className="flex items-center gap-2 text-sm">
          {getSaveIcon()}
          <span className="text-gray-600">{getSaveText()}</span>
        </div>

        {/* Changes Not Live Badge */}
        {hasChanges && (
          <Badge
            variant="outline"
            className="gap-1.5 border-yellow-400 bg-yellow-50 text-yellow-700"
          >
            <Circle className="h-2 w-2 fill-yellow-600" />
            Changes not live
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Save Draft Button */}
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || saveStatus === "saving"}
          variant="outline"
          size="sm"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Draft"
          )}
        </Button>

        {/* Preview Button */}
        <Button onClick={handlePreview} variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>

        {/* Publish Button */}
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
