"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Github, Globe } from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  socialLinks?: SocialLink[];
}

interface TeamSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    members: TeamMember[];
    columns?: number;
  };
}

const socialIconMap = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  website: Globe,
};

export function TeamSection({ data }: TeamSectionProps) {
  const { title, subtitle, members, columns = 3 } = data;

  const gridColsClass =
    {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
    }[columns] || "md:grid-cols-3";

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Team Grid */}
        <div className={`grid grid-cols-1 ${gridColsClass} gap-8`}>
          {members.map((member, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6 text-center">
                {/* Avatar */}
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="text-2xl">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-primary font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {member.bio}
                </p>

                {/* Social Links */}
                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="flex justify-center gap-2">
                    {member.socialLinks.map((social, idx) => {
                      const Icon =
                        socialIconMap[
                          social.platform.toLowerCase() as keyof typeof socialIconMap
                        ];
                      if (!Icon) return null;

                      return (
                        <Button
                          key={idx}
                          variant="ghost"
                          size="icon"
                          asChild
                          className="hover:text-primary"
                        >
                          <Link
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="sr-only">{social.platform}</span>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
