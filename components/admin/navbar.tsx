"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Menu,
  X,
  Globe,
  LayoutTemplate,
  CreditCard,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Sites",
    href: "/admin/sites",
    icon: Globe,
  },
  {
    name: "Templates",
    href: "/admin/templates",
    icon: LayoutTemplate,
  },
  {
    name: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                S
              </div>
              <span className="text-xl font-bold">Structura</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md transition-colors group text-sm font-medium ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="relative">
                    {item.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-black transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                    ></span>
                  </span>
                </Link>
              );
            })}
            <Link
              href="/app"
              className="relative flex items-center rounded-md transition-colors text-muted-foreground hover:text-foreground group text-sm font-medium"
            >
              <span className="relative">
                User Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300 ease-out"></span>
              </span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center">
            <AnimatedButton
              asChild
              animationType="none"
              className="bg-gradient-to-r from-black via-gray-900 to-gray-800 hover:from-gray-900 hover:via-black hover:to-gray-900 text-white border-2"
            >
              <button onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
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
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 rounded-md transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              href="/app"
              className="flex items-center px-3 rounded-md transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <span>User Dashboard</span>
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  signOut({ callbackUrl: "/login" });
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-3 rounded-md transition-colors text-muted-foreground hover:text-foreground justify-start"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
