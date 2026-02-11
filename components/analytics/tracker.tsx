"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface AnalyticsTrackerProps {
  siteId: string;
}

export function AnalyticsTracker({ siteId }: AnalyticsTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Only track in production and if consent is given
    const hasConsent = localStorage.getItem("cookie-consent") === "accepted";
    
    if (process.env.NODE_ENV !== "production" || !hasConsent) {
      return;
    }

    // Track page view
    const trackView = async () => {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId,
            path: pathname,
          }),
        });
      } catch (error) {
        // Fail silently - analytics shouldn't break the site
        console.debug("Analytics tracking failed:", error);
      }
    };

    trackView();
  }, [siteId, pathname]);

  return null; // This component doesn't render anything
}
