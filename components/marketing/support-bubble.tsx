"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  X,
  Mail,
  MessageCircle,
  Phone,
  MessageSquare,
  Send,
} from "lucide-react";
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
        <Card className="fixed bottom-24 right-4 w-80 shadow-2xl z-[100] animate-in slide-in-from-bottom-4 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">How can we help?</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-white/80">
              Get in touch with our support team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatedButton
              variant="outline"
              animationType="bounce"
              className="w-full justify-start border border-white/30 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
              asChild
            >
              <a href="mailto:support@structura.com">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </a>
            </AnimatedButton>

            <AnimatedButton
              variant="outline"
              animationType="bounce"
              className="w-full justify-start border border-white/30 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
              asChild
            >
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send className="mr-2 h-4 w-4" />
                WhatsApp Chat
              </a>
            </AnimatedButton>

            <AnimatedButton
              variant="outline"
              animationType="bounce"
              className="w-full justify-start border border-white/30 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
              asChild
            >
              <a href="tel:+1234567890">
                <Phone className="mr-2 h-4 w-4" />
                Call Us
              </a>
            </AnimatedButton>

            <AnimatedButton
              variant="outline"
              animationType="bounce"
              className="w-full justify-start border border-white/30 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
              asChild
            >
              <a href="/docs" onClick={() => setIsOpen(false)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Documentation
              </a>
            </AnimatedButton>

            <div className="pt-2 border-t border-white/20">
              <p className="text-xs text-white/70 text-center">
                We typically respond within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        size="lg"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-[100] hover:scale-110 transition-transform bg-white/10 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 shadow-2xl"
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
