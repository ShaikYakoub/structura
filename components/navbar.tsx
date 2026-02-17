"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, ArrowLeft, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
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
      <div className="w-full px-4 sm:px-6 lg:px-8">
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
              href="/templates"
              className={`relative flex items-center rounded-md transition-colors group text-sm font-medium ${
                isActive("/templates")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="relative">
                Browse Templates
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-black transition-all duration-300 ease-out ${isActive("/templates") ? "w-full" : "w-0 group-hover:w-full"}`}
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
              <div className="relative">
                <Avatar className="h-6 w-6 ring-2 ring-gray-400 ring-offset-2">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt="Profile"
                  />
                  <AvatarFallback className="h-6 w-6">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="sr-only">Settings</span>
            </Link>

            {isSuperAdmin && (
              <Button
                variant="ghost"
                onClick={() => router.push("/admin")}
                className="bg-black text-white hover:bg-gray-800 rounded-md transition-colors text-sm font-medium py-2"
              >
                Super Admin Panel
              </Button>
            )}
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
              className={`flex items-center rounded-md transition-colors ${
                isActive("/app") && pathname === "/app"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span>Sites</span>
            </Link>

            <Link
              href="/templates"
              className={`flex items-center py-2 rounded-md transition-colors ${
                isActive("/templates")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span>Browse Templates</span>
            </Link>

            <Link
              href="/app/settings"
              className={`flex items-center py-2 rounded-md transition-colors ${
                isActive("/app/settings")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <Avatar className="h-6 w-6 mr-2 ring-2 ring-gray-400 ring-offset-2">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt="Profile"
                  />
                  <AvatarFallback className="h-6 w-6">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <span>Settings</span>
            </Link>

            {isSuperAdmin && (
              <Button
                variant="ghost"
                onClick={() => {
                  router.push("/admin");
                  setIsOpen(false);
                }}
                className="bg-black text-white hover:bg-gray-800 rounded-md transition-colors py-2"
              >
                Super Admin Panel
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
