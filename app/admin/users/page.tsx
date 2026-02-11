import prisma from "@/lib/prisma";
import { UserManagementTable } from "@/components/admin/user-management-table";

async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isPro: true,
      createdAt: true,
      bannedAt: true,
      banReason: true,
      tenant: {
        select: {
          sites: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  // Transform to match expected shape
  const transformedUsers = users.map((user) => ({
    ...user,
    _count: {
      sites: user.tenant?.sites.length || 0,
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users and their accounts
        </p>
      </div>

      <UserManagementTable users={transformedUsers} />
    </div>
  );
}
