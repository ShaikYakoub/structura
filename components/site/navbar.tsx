"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  type: "page" | "external";
}

interface NavbarProps {
  data: NavItem[];
  logo?: string | null;
  siteName?: string;
  bgColor?: string;
  ctaButton?: {
    label: string;
    href: string;
  };
}

export function Navbar({
  data,
  logo,
  siteName,
  bgColor = "#ffffff",
  ctaButton,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-2">
            {logo ? (
              <div className="relative h-8 w-auto">
                <Image
                  src={logo}
                  alt={siteName || "Logo"}
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ) : (
              <span className="text-xl font-bold">{siteName || "Site"}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {data.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
                target={item.type === "external" ? "_blank" : undefined}
                rel={
                  item.type === "external" ? "noopener noreferrer" : undefined
                }
              >
                {item.label}
              </Link>
            ))}

            {ctaButton && (
              <Button asChild size="sm">
                <Link href={ctaButton.href}>{ctaButton.label}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>{siteName || "Navigation"}</SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col space-y-4">
                  {data.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                      target={item.type === "external" ? "_blank" : undefined}
                      rel={
                        item.type === "external"
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {item.label}
                    </Link>
                  ))}

                  {ctaButton && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Button asChild className="mt-4">
                        <Link
                          href={ctaButton.href}
                          onClick={() => setIsOpen(false)}
                        >
                          {ctaButton.label}
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
