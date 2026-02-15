import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { BillingClient } from "./client";

export default async function AdminBillingPage() {
  // Fetch all transactions
  const allTransactions = await getAllTransactions();

  // Fetch recent audit logs
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingClient allTransactions={allTransactions} auditLogs={auditLogs} />
    </Suspense>
  );
}

async function getAllTransactions() {
  // Fetch users with recent subscription changes
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { isPro: true },
        {
          razorpayCurrentPeriodEnd: {
            not: null,
          },
        },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      isPro: true,
      razorpaySubscriptionId: true,
      razorpayCurrentPeriodEnd: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform to transaction format
  return users.map((user) => ({
    id: user.id,
    userEmail: user.email,
    userName: user.name || "Unknown",
    amount: 999,
    currency: "INR",
    status: user.isPro ? "success" : "canceled",
    date: user.razorpayCurrentPeriodEnd || user.createdAt,
    subscriptionId: user.razorpaySubscriptionId,
  }));
}
