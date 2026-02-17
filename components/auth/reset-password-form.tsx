"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setIsSuccess(true);
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to send reset email");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 p-6 border rounded-lg bg-green-50 dark:bg-green-950/20">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Check your email</h3>
            <p className="text-sm text-muted-foreground mt-2">
              If an account exists with <strong>{email}</strong>, you will
              receive a password reset link shortly.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setEmail("");
            }}
          >
            Send another link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Reset Link
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        We'll send you an email with instructions to reset your password
      </p>
    </form>
  );
}
