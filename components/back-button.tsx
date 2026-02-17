"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => window.history.back()}
      className="p-0"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
}
