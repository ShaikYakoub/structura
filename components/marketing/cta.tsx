"use client";

import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-6 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-12 md:p-20">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center">
              Ready to build something amazing?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of creators who have already launched their dream
              websites with Structura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedButton
                size="lg"
                variant="outline"
                animationType="bounce"
                className="border-2"
                onClick={() => {
                  const element = document.getElementById("showcase");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                View Templates
              </AnimatedButton>
              <AnimatedButton
                size="lg"
                variant="secondary"
                asChild
                animationType="bounce"
                className="border-2 bg-gradient-to-r from-black via-gray-900 to-gray-800 hover:from-gray-900 hover:via-black hover:to-gray-900 text-white"
              >
                <Link href="/register">
                  Start Building for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </AnimatedButton>
            </div>
            <p className="text-sm mt-6 opacity-75">
              No credit card required • 7-day money-back guarantee
            </p>
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}
