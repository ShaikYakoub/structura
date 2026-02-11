"use client";

import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  animationType?: "bounce" | "none";
}

export function AnimatedButton({
  className,
  animationType = "bounce",
  children,
  ...props
}: AnimatedButtonProps) {
  if (animationType === "none") {
    return (
      <Button
        className={cn("transition-all duration-200 hover:shadow-lg", className)}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={cn(
        "transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
