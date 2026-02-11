"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-12 md:p-20">
        >
          {/* Background decoration */}
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
              <Button size="lg" variant="secondary" asChild className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2">
                <Link href="/register">
                  Start Building for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                onClick={() => {
                  const element = document.getElementById('showcase');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Templates
              </Button>
            </div>
            <p className="text-sm mt-6 opacity-75">
              No credit card required • 7-day money-back guarantee
            </p>
          </div>

          {/* Decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
