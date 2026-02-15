"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Settings, Menu, X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent("sidebar-toggle"));
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Structura</h2>
            <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="p-2 hover:bg-gray-100"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <nav className="px-4 space-y-1 flex-1">
        <Link
          href="/app"
          className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
            isActive("/app") && pathname === "/app"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          } ${isCollapsed ? "justify-center px-2" : ""}`}
        >
          <LayoutDashboard size={20} />
          {!isCollapsed && <span>Sites</span>}
        </Link>

        <Link
          href="/app/settings"
          className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
            isActive("/app/settings")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          } ${isCollapsed ? "justify-center px-2" : ""}`}
        >
          <Settings size={20} />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"}`}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={20} className={isCollapsed ? "" : "mr-3"} />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
