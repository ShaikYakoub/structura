"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

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

interface DownloadReportButtonProps {
  transactions: Transaction[];
}

export function DownloadReportButton({
  transactions,
}: DownloadReportButtonProps) {
  const handleDownload = () => {
    // Convert transactions to CSV
    const headers = [
      "User Name",
      "Email",
      "Amount",
      "Currency",
      "Status",
      "Date",
      "Subscription ID",
    ];
    const rows = transactions.map((t) => [
      t.userName,
      t.userEmail,
      t.amount.toString(),
      t.currency,
      t.status,
      format(new Date(t.date), "yyyy-MM-dd HH:mm:ss"),
      t.subscriptionId || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleDownload}>
      <Download className="mr-2 h-4 w-4" />
      Download Report
    </Button>
  );
}
