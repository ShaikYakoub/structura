import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Structura account password",
};

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold mt-4">Reset your password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <ResetPasswordForm />

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
