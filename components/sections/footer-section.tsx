"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LinkItem {
  label: string;
  href: string;
}

interface LinkColumn {
  title: string;
  links: LinkItem[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface FooterSectionProps {
  data: {
    logo?: string;
    siteName?: string;
    description?: string;
    columns: LinkColumn[];
    socialLinks?: SocialLink[];
    copyrightText?: string;
  };
}

const socialIconMap = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
};

export function FooterSection({ data }: FooterSectionProps) {
  const {
    logo,
    siteName = "Company",
    description,
    columns,
    socialLinks = [],
    copyrightText = "© 2026 All rights reserved.",
  } = data;

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            {logo ? (
              <div className="relative h-8 w-32 mb-4">
                <Image src={logo} alt={siteName} fill className="object-contain object-left" />
              </div>
            ) : (
              <h3 className="text-xl font-bold mb-4">{siteName}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                {description}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = socialIconMap[social.platform.toLowerCase() as keyof typeof socialIconMap];
                  if (!Icon) return null;

                  return (
                    <Link
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{social.platform}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index} className="lg:col-span-2">
              <h4 className="font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">{copyrightText}</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
