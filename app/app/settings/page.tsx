import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SettingsContent } from "@/components/settings/settings-content";

export const metadata = {
  title: "Profile Settings",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <SettingsContent user={user} />;
}
