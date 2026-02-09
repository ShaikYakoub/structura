"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">Structura</h2>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="px-4 space-y-1 flex-1">
        <Link
          href="/app"
          className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
            isActive("/app") && pathname === "/app"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Sites</span>
        </Link>

        <Link
          href="/app/settings"
          className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
            isActive("/app/settings")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
