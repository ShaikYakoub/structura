"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialBarProps {
  data: {
    title?: string;
    subtitle?: string;
    links: SocialLink[];
    variant?: string;
    size?: string;
  };
}

const socialIconMap = {
  facebook: { icon: Facebook, label: "Facebook", color: "hover:text-blue-600" },
  twitter: { icon: Twitter, label: "Twitter", color: "hover:text-sky-500" },
  instagram: {
    icon: Instagram,
    label: "Instagram",
    color: "hover:text-pink-600",
  },
  linkedin: { icon: Linkedin, label: "LinkedIn", color: "hover:text-blue-700" },
  github: {
    icon: Github,
    label: "GitHub",
    color: "hover:text-gray-900 dark:hover:text-gray-100",
  },
  youtube: { icon: Youtube, label: "YouTube", color: "hover:text-red-600" },
  website: { icon: Globe, label: "Website", color: "hover:text-primary" },
};

export function SocialBar({ data }: SocialBarProps) {
  const {
    title,
    subtitle,
    links,
    variant = "default",
    size = "default",
  } = data;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight mb-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {/* Social Icons */}
        <div className="flex flex-wrap justify-center gap-4">
          {links.map((link, index) => {
            const socialInfo =
              socialIconMap[
                link.platform.toLowerCase() as keyof typeof socialIconMap
              ];

            if (!socialInfo) {
              return null;
            }

            const Icon = socialInfo.icon;

            return (
              <Button
                key={index}
                variant={variant as any}
                size={size as any}
                asChild
                className={`${socialInfo.color} transition-colors`}
              >
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Icon className="h-5 w-5" />
                  <span>{socialInfo.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
