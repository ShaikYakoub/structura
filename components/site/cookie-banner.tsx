"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-2 p-4 shadow-lg md:left-auto md:right-4 md:max-w-md">
      <div className="flex items-start gap-3">
        <Cookie className="h-5 w-5 flex-shrink-0 text-primary" />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold">Cookie Consent</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience and analyze
              site traffic. By clicking &quot;Accept&quot;, you consent to our
              use of cookies.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAccept} size="sm" className="flex-1">
              Accept
            </Button>
            <Button
              onClick={handleDecline}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        </div>
        <Button
          onClick={handleDecline}
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
