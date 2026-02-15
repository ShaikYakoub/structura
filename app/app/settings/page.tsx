import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get full user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      isPro: true,
      razorpayCurrentPeriodEnd: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Profile Settings */}
        <div className="space-y-6">
          <SettingsForm user={user} />
        </div>

        {/* Right Column - Subscription and Account Info */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Subscription</CardTitle>
              <CardDescription>
                Your current subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {user.isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                </div>
                <Badge variant={user.isPro ? "default" : "secondary"}>
                  {user.isPro ? "PRO" : "FREE"}
                </Badge>
              </div>

              {user.isPro && user.razorpayCurrentPeriodEnd && (
                <div>
                  <p className="font-medium">Billing Cycle</p>
                  <p className="text-sm text-muted-foreground">
                    Renews on{" "}
                    {new Date(
                      user.razorpayCurrentPeriodEnd,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}

              {!user.isPro && (
                <div className="pt-2">
                  <Button asChild>
                    <Link href="/app/billing">Upgrade to Pro</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
