"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Laptop, X } from "lucide-react";

export function MobileRecommendationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="mb-4 mx-4 mt-4">
      <Laptop className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        Desktop Recommended
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-xs">
        For the best editing experience, we recommend using a desktop or laptop
        computer. Mobile editing has limited functionality.
      </AlertDescription>
    </Alert>
  );
}
