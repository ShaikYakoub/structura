"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              S
            </div>
            <span className="text-xl font-bold">Structura</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#showcase"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <AnimatedButton
              asChild
              animationType="none"
              className="bg-gradient-to-r from-black via-gray-900 to-gray-800 hover:from-gray-900 hover:via-black hover:to-gray-900 text-white border-2"
            >
              <Link href="/register">Get Started</Link>
            </AnimatedButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="#features"
              className="block text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#showcase"
              className="block text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Templates
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <AnimatedButton
                asChild
                animationType="none"
                className="w-full bg-gradient-to-r from-black via-gray-900 to-gray-800 hover:from-gray-900 hover:via-black hover:to-gray-900 text-white border-2"
              >
                <Link href="/register">Get Started</Link>
              </AnimatedButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
