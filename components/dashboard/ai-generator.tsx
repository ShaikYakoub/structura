"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2, X } from "lucide-react";
import { generateSiteFromPrompt } from "@/app/actions/ai";

export function AIGenerator() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your business");
      return;
    }

    if (prompt.length < 10) {
      toast.error("Please provide more details about your business");
      return;
    }

    if (prompt.length > 10000) {
      toast.error("Please keep your description under 10,000 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateSiteFromPrompt(prompt);

      if (result.success && result.siteId) {
        toast.success("Site generated successfully!");
        setIsOpen(false);
        setPrompt("");
      } else {
        toast.error(result.error || "Failed to generate site");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-5 w-5" />
        Create with AI
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1], // Custom easing for smooth animation
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05, duration: 0.2 }}
                className="bg-white rounded-lg border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="flex items-center gap-2 text-2xl font-semibold">
                    <Sparkles className="h-6 w-6 text-primary" />
                    AI Site Generator
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Prompt Input */}
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Describe Your Business</Label>
                      <div className="relative">
                        <Textarea
                          id="prompt"
                          placeholder="Example: A luxury pet hotel in Dubai with grooming services, pet spa, and 24/7 care..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          rows={4}
                          disabled={isLoading}
                          maxLength={10000}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-2">
                        <span className="text-yellow-500">✨</span>
                        Be specific when describing your business and services to get the
                        best results.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        disabled={
                          isLoading || prompt.length < 10 || prompt.length > 10000
                        }
                        className="flex-1 gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate Site
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3 p-4 rounded-lg bg-muted/50 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          AI is working its magic...
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Analyzing your business description
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-100" />
                            Selecting optimal components
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-200" />
                            Generating compelling copy
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-300" />
                            Creating your site structure
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}