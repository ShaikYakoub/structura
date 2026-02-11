"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface Page {
  id: string;
  slug: string;
  name: string;
}

interface NavItem {
  label: string;
  href: string;
  type: "page" | "external";
}

interface NavManagerProps {
  siteId: string;
  currentNavigation: NavItem[];
  pages: Page[];
}

export function NavManager({
  siteId,
  currentNavigation,
  pages,
}: NavManagerProps) {
  const [navItems, setNavItems] = useState<NavItem[]>(currentNavigation);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<NavItem>({
    label: "",
    href: "",
    type: "page",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = () => {
    if (!newItem.label || !newItem.href) {
      toast.error("Please fill in all fields");
      return;
    }

    setNavItems([...navItems, newItem]);
    setNewItem({ label: "", href: "", type: "page" });
    setIsAdding(false);
    toast.success("Navigation item added");
  };

  const handleRemoveItem = (index: number) => {
    setNavItems(navItems.filter((_, i) => i !== index));
    toast.success("Navigation item removed");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/navigation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navigation: navItems }),
      });

      if (!response.ok) throw new Error("Failed to save navigation");

      toast.success("Navigation saved successfully");
    } catch (error) {
      toast.error("Failed to save navigation");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...navItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];
    setNavItems(newItems);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Site Navigation</h2>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Existing Navigation Items */}
      <div className="space-y-2">
        {navItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground">
                No navigation items yet. Add your first link below.
              </p>
            </CardContent>
          </Card>
        ) : (
          navItems.map((item, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-2 p-3">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === navItems.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.href}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add New Item Form */}
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add Navigation Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="Home, About, Contact..."
                value={newItem.label}
                onChange={(e) =>
                  setNewItem({ ...newItem, label: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Link Type</Label>
              <Select
                value={newItem.type}
                onValueChange={(value: "page" | "external") =>
                  setNewItem({ ...newItem, type: value, href: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Internal Page</SelectItem>
                  <SelectItem value="external">External URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="href">
                {newItem.type === "page" ? "Select Page" : "URL"}
              </Label>

              {newItem.type === "page" ? (
                <Select
                  value={newItem.href}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, href: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a page..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/">Home</SelectItem>
                    {pages.map((page) => (
                      <SelectItem
                        key={page.id}
                        value={page.slug === "/" ? "/" : `/${page.slug}`}
                      >
                        {page.name} ({page.slug === "/" ? "/" : `/${page.slug}`}
                        )
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="href"
                  placeholder="https://example.com"
                  value={newItem.href}
                  onChange={(e) =>
                    setNewItem({ ...newItem, href: e.target.value })
                  }
                />
              )}
            </div>

            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button onClick={handleAddItem} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" /> Add Link
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewItem({ label: "", href: "", type: "page" });
                  }}
                >
                  Cancel
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Navigation Link
          </Button>
        </motion.div>
      )}
    </div>
  );
}
