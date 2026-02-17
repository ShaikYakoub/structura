"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionsTable } from "@/components/admin/transactions-table";
import { DownloadReportButton } from "@/components/admin/download-report-button";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Transaction {
  id: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  subscriptionId: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: any;
  adminEmail: string;
  createdAt: Date;
}

interface BillingClientProps {
  allTransactions: Transaction[];
  auditLogs: AuditLog[];
}

export function BillingClient({
  allTransactions,
  auditLogs,
}: BillingClientProps) {
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Show only last 10 or all transactions based on state
  const transactions = showAllTransactions
    ? allTransactions
    : allTransactions.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Revenue</h1>
          <p className="text-muted-foreground">
            Platform revenue and subscription management
          </p>
        </div>
        <DownloadReportButton transactions={allTransactions} />
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest payment activity across the platform
              {!showAllTransactions && allTransactions.length > 10 && (
                <span className="block text-xs mt-1">
                  Showing last 10 of {allTransactions.length} transactions
                </span>
              )}
            </CardDescription>
          </div>
          {allTransactions.length > 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className="flex items-center gap-2"
            >
              {showAllTransactions ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  See All
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={transactions} />
        </CardContent>
      </Card>

      {/* Audit Log Viewer */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Recent activity and system events (Last 50 entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogViewer logs={auditLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
