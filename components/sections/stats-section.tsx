"use client";

import { LucideIcon, Users, TrendingUp, Award, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  label: string;
  value: string;
  icon: string;
}

interface StatsSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    stats: Stat[];
  };
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  trending: TrendingUp,
  award: Award,
  star: Star,
};

export function StatsSection({ data }: StatsSectionProps) {
  const { title, subtitle, stats } = data;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
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

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Users;

            return (
              <Card key={index} className="text-center border-border">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
