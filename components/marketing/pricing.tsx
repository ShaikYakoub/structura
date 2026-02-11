"use client";

import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for trying out Structura",
    features: [
      "1 Published Site",
      "Subdomain Hosting",
      "Basic Templates",
      "Community Support",
      "Structura Branding",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For serious creators and businesses",
    features: [
      "Unlimited Sites",
      "Custom Domain",
      "Remove Branding",
      "Priority Support",
      "Advanced Analytics",
      "Custom Code Injection",
      "Premium Templates",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple, transparent <span className="text-primary">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade when you're ready. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -right-6 bg-white/20 backdrop-blur-lg border border-white/30 text-primary px-3 py-1.5 rounded-full text-xs font-medium shadow-xl z-50"
                >
                  MOST POPULAR ✨
                </motion.div>
              )}
              <Card
                className={`
                  relative select-none
                  ${plan.popular ? "border-primary shadow-lg scale-105" : ""}
                `}
              >

                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <AnimatedButton
                    asChild
                    animationType="bounce"
                    className="w-full border-2"
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </AnimatedButton>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          All plans include 7-day money-back guarantee • No credit card required
          for free plan
        </motion.p>
      </div>
    </section>
  );
}
