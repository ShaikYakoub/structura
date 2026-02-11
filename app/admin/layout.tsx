import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import {
  LayoutDashboard,
  Users,
  Globe,
  Settings,
  Shield,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Sites", href: "/admin/sites", icon: Globe },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/404");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">God Mode 👑</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
