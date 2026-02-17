"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { BackButton } from "@/components/back-button";
import { Camera, Loader2, LogOut, Eye, EyeOff, Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";
import Link from "next/link";
import {
  updateProfileImage,
  updateUserProfile,
  updatePassword,
  deleteAccount,
} from "@/app/actions/user";
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
import { format } from "date-fns";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
}

interface SettingsContentProps {
  user: User;
}

export function SettingsContent({ user }: SettingsContentProps) {
  const router = useRouter();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [optimisticImage, setOptimisticImage] = useState<string | null>(
    user.image,
  );

  const [profileForm, setProfileForm] = useState({
    name: user.name || "",
    email: user.email,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deletePasswordInput, setDeletePasswordInput] = useState("");

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    // Optimistic update - show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setOptimisticImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await updateProfileImage(formData);

      if (result.success && result.imageUrl) {
        toast.success("Profile picture updated!");
        setOptimisticImage(result.imageUrl);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to upload image");
        setOptimisticImage(user.image); // Revert on error
      }
    } catch (error) {
      toast.error("Something went wrong");
      setOptimisticImage(user.image); // Revert on error
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const result = await updateUserProfile({
        name: profileForm.name.trim() || null,
        email: profileForm.email,
      });

      if (result.success) {
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);

    try {
      const result = await updatePassword(passwordForm);

      if (result.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      const result = await deleteAccount(deletePasswordInput);

      if (result.success) {
        toast.success("Account deleted successfully");
        await signOut({ callbackUrl: "/" });
      } else {
        toast.error(result.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeletingAccount(false);
      setDeletePasswordInput("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="space-y-8 w-full max-w-3xl mx-auto">
        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <div className="space-y-8">
          {/* Profile Picture & Information */}
          <div className="flex flex-col items-center">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="p-0">Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal details and account information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex-1 space-y-4 mt-0 p-0">
                  {!showProfileForm ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">Full Name</p>
                          <p className="text-sm text-muted-foreground">
                            {user.name || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowProfileForm(true)}
                      >
                        Edit Profile Information
                      </Button>
                    </div>
                  ) : (
                    <>
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                name: e.target.value,
                              })
                            }
                            disabled={isUpdatingProfile}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                email: e.target.value,
                              })
                            }
                            disabled={isUpdatingProfile}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowProfileForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isUpdatingProfile}>
                            {isUpdatingProfile && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is using a strong password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </Button>
              ) : (
                <>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          disabled={isUpdatingPassword}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          disabled={isUpdatingPassword}
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          disabled={isUpdatingPassword}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUpdatingPassword}>
                        {isUpdatingPassword && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Change Password
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
          {/* Sign Out & Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sign Out */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent modal>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <div className="text-sm text-muted-foreground space-y-3">
                        <span>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers, including:
                        </span>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>All your websites and pages</li>
                          <li>Your profile information</li>
                          <li>All uploaded files and images</li>
                          <li>Your subscription and billing history</li>
                        </ul>
                        <div className="pt-4">
                          <Label htmlFor="delete-password">
                            Enter your password to confirm
                          </Label>
                          <Input
                            id="delete-password"
                            type="password"
                            value={deletePasswordInput}
                            onChange={(e) =>
                              setDeletePasswordInput(e.target.value)
                            }
                            placeholder="Your password"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeletingAccount}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={
                          !deletePasswordInput.trim() || isDeletingAccount
                        }
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingAccount && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
