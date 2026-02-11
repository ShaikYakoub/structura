"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Oops!</h1>
              <p className="text-muted-foreground">
                Something went wrong. Our team has been notified.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && (
              <pre className="p-4 bg-muted rounded-lg text-left text-xs overflow-auto">
                {error.message}
              </pre>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={() => reset()}>Try Again</Button>
              <Button variant="outline" asChild>
                <a href="/">Go Home</a>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
