"use client";

import { motion } from "framer-motion";
import { Hand, Search, Globe, Zap, Palette, Lock } from "lucide-react";

const features = [
  {
    icon: Hand,
    title: "Drag & Drop Editor",
    description: "Build stunning pages by simply dragging components. No coding knowledge required.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Search,
    title: "AI-Powered SEO",
    description: "Automatically optimize your site for search engines with built-in SEO tools.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description: "Connect your own domain and build your brand with a professional web presence.",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: Zap,
    title: "Ultra-Fast Hosting",
    description: "Lightning-fast page loads with our global CDN infrastructure.",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: Palette,
    title: "Beautiful Templates",
    description: "Start with professionally designed templates and customize to your brand.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Lock,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with automatic SSL certificates and daily backups.",
    gradient: "from-indigo-500/20 to-purple-500/20",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="text-primary">build faster</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features that make website building effortless and enjoyable
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`
                  relative overflow-hidden rounded-2xl border bg-gradient-to-br ${feature.gradient}
                  p-8 hover:shadow-lg transition-shadow
                  ${index === 0 ? "md:col-span-2 lg:col-span-1" : ""}
                  ${index === 4 ? "lg:col-span-2" : ""}
                `}
              >
                <div className="relative z-10">
                  <div className="inline-flex p-3 bg-background rounded-xl shadow-sm mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>

                {/* Decorative element */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
