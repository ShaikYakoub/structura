"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const templates = [
  {
    name: "Business Pro",
    category: "Business",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Creative Portfolio",
    category: "Portfolio",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    name: "E-Commerce Store",
    category: "E-Commerce",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    name: "Modern Blog",
    category: "Blog",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

export function Showcase() {
  return (
    <section id="showcase" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Beautiful templates to{" "}
            <span className="text-primary">get started</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose from our collection of professionally designed templates
          </p>
        </motion.div>

        {/* Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="relative">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory">
            {templates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 md:w-auto snap-center"
              >
                <div className="group relative overflow-hidden rounded-2xl border bg-background hover:shadow-xl transition-all duration-300">
                  {/* Image Container */}
                  <div
                    className={`relative aspect-[4/3] bg-gradient-to-br ${template.color} overflow-hidden`}
                  >
                    {/* Placeholder for template screenshot */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-sm font-medium">{template.name}</p>
                      </div>
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button variant="secondary" size="sm" asChild>
                        <Link href="/templates">
                          View Template
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" asChild>
            <Link href="/templates">
              View All Templates
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
