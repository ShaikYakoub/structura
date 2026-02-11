"use client";

import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="container mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block"
            >
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                ✨ No coding required
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Build Your Dream Website{" "}
              <span className="text-primary">in Minutes</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              No coding required. Drag, drop, and launch. The most powerful
              website builder for startups and creators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <AnimatedButton
                size="lg"
                asChild
                animationType="bounce"
                className="text-base border-2"
              >
                <Link href="/register">
                  Start Building for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </AnimatedButton>
              <AnimatedButton
                size="lg"
                variant="outline"
                animationType="bounce"
                className="text-base border-2"
                onClick={() => scrollToSection("showcase")}
              >
                <Play className="mr-2 h-5 w-5" />
                View Templates
              </AnimatedButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              No credit card required • Free forever plan • Cancel anytime
            </motion.p>
          </motion.div>

          {/* Right: Browser Mockup */}
          <div className="relative">
            {/* Browser Window */}
            <div className="relative rounded-lg border-2 shadow-2xl bg-background overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-background rounded text-xs flex items-center px-3 text-muted-foreground">
                    editor.structura.com
                  </div>
                </div>
              </div>

              {/* Editor Interface Screenshot */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 select-none relative overflow-hidden">
                {/* Grid pattern overlay - More visible */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                <div className="relative z-10">
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Left Sidebar */}
                    <div className="col-span-3 bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="h-3 bg-primary/30 rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-2/3" />
                    </div>

                    {/* Main Canvas */}
                    <div className="col-span-9 bg-background rounded-lg p-6 space-y-4">
                      <div className="h-6 bg-primary/20 rounded w-1/2" />
                      <div className="h-24 bg-muted/50 rounded" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-16 bg-muted/30 rounded" />
                        <div className="h-16 bg-muted/30 rounded" />
                        <div className="h-16 bg-muted/30 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements for visual interest */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg"
            >
              Live Preview ✨
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
