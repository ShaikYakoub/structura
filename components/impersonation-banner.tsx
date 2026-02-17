"use client";

import { useSession, signOut } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const { data: session } = useSession();

  if (!session || !(session?.user as any)?.isImpersonated) {
    return null;
  }

  return (
    <Alert className="border-slate-200/30 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm mb-4">
      <ShieldAlert className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
            🎭 Admin Impersonation Active
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Logged in as <strong>{session.user.name}</strong> by admin{" "}
            <strong>{(session.user as any).originalAdmin}</strong>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/app" })}
          className="ml-auto"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit Impersonation
        </Button>
      </AlertDescription>
    </Alert>
  );
}
