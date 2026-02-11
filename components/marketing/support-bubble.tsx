"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Mail, MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SupportBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Support Card (appears when open) */}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 w-80 shadow-2xl z-50 animate-in slide-in-from-bottom-4 bg-white/60 dark:bg-white/20 backdrop-blur-xl border border-white/30 dark:border-white/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">How can we help?</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Get in touch with our support team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatedButton
              variant="outline"
              animationType="bounce"
              className="w-full justify-start border-2"
              asChild
            >
              <a href="mailto:support@structura.com">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </a>
            </AnimatedButton>

            <AnimatedButton
              variant="outline"
              animationType="bounce"
              className="w-full justify-start border-2"
              asChild
            >
              <a href="/docs" onClick={() => setIsOpen(false)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Documentation
              </a>
            </AnimatedButton>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                We typically respond within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        size="lg"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform bg-white hover:bg-gray-50 border-2 border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <HelpCircle className="h-6 w-6" />
        )}
      </Button>
    </>
  );
}
