import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminNavbar } from "@/components/admin/navbar";

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
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      {/* Spacer for fixed navbar */}
      <div className="h-16" aria-hidden="true" />
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
