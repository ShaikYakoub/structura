"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { updateUserProfile } from "@/app/actions/user";

interface SettingsFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateUserProfile({
        name: formData.name,
        email: formData.email,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        setHasChanges(false);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account details and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isLoading}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isLoading}
                placeholder="you@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Changing your email will require verification
              </p>
            </div>

            {/* User ID (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                value={user.id}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your unique user identifier
              </p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={!hasChanges || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>

          {hasChanges && !isLoading && (
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
