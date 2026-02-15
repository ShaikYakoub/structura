"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useState, useEffect } from "react";
import { LogOut, Menu, X, ArrowLeft } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  // Check if user is super admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/admin/check");
          const data = await response.json();
          setIsSuperAdmin(data.isAdmin);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsSuperAdmin(false);
        }
      } else {
        setIsSuperAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/app" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                S
              </div>
              <span className="text-xl font-bold">Structura</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/app"
              className={`relative flex items-center rounded-md transition-colors group text-sm font-medium ${
                isActive("/app") && pathname === "/app"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="relative">
                Sites
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-black transition-all duration-300 ease-out ${isActive("/app") && pathname === "/app" ? "w-full" : "w-0 group-hover:w-full"}`}
                ></span>
              </span>
            </Link>

            <Link
              href="/app/settings"
              className={`relative flex items-center rounded-md transition-colors group text-sm font-medium ${
                isActive("/app/settings")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="relative">
                Settings
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-black transition-all duration-300 ease-out ${isActive("/app/settings") ? "w-full" : "w-0 group-hover:w-full"}`}
                ></span>
              </span>
            </Link>

            {isSuperAdmin && (
              <Link
                href="/admin"
                className="relative flex items-center gap-3 rounded-md transition-colors text-muted-foreground hover:text-foreground group text-sm font-medium"
              >
                <ArrowLeft size={20} />
                <span className="relative">
                  Back to Admin
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300 ease-out"></span>
                </span>
              </Link>
            )}

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
            <Link
              href="/app"
              className={`flex items-center px-3 rounded-md transition-colors ${
                isActive("/app") && pathname === "/app"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span>Sites</span>
            </Link>

            <Link
              href="/app/settings"
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive("/app/settings")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span>Settings</span>
            </Link>

            {isSuperAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <ArrowLeft size={20} />
                <span>Back to Admin</span>
              </Link>
            )}

            <div className="flex flex-col gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  signOut({ callbackUrl: "/login" });
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-3 rounded-md transition-colors text-muted-foreground hover:text-foreground justify-start"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
