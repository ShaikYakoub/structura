import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Structura account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                S
              </div>
              <span className="text-2xl font-bold">Structura</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Start building beautiful websites today
          </p>
        </div>

        {/* Registration Form */}
        <RegisterForm />

        {/* Sign In Link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
