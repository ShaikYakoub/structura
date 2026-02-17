import { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set a new password for your Structura account",
};

export default function NewPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                S
              </div>
              <span className="text-2xl font-bold">Structura</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Set new password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your new password below
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <NewPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
