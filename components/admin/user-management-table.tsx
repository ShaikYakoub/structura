"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserCog,
  Ban,
  CheckCircle,
  AlertTriangle,
  Search,
  ArrowUpDown,
} from "lucide-react";
import {
  banUser,
  unbanUser,
  createImpersonationSession,
} from "@/app/actions/admin";

interface User {
  id: string;
  name: string | null;
  email: string;
  isPro: boolean;
  createdAt: Date;
  bannedAt: Date | null;
  banReason: string | null;
  _count: {
    sites: number;
  };
}

export function UserManagementTable({ users }: { users: User[] }) {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");

  // New state for search, filters, and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "pro" | "free">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">(
    "all",
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      // Search filter
      const matchesSearch =
        (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Plan filter
      const matchesPlan =
        planFilter === "all" ||
        (planFilter === "pro" && user.isPro) ||
        (planFilter === "free" && !user.isPro);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !user.bannedAt) ||
        (statusFilter === "banned" && user.bannedAt);

      return matchesSearch && matchesPlan && matchesStatus;
    });

    // Sort by creation date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [users, searchQuery, planFilter, statusFilter, sortOrder]);

  const handleBan = async () => {
    if (!selectedUser) return;

    const result = await banUser(selectedUser.id, banReason);

    if (result.success) {
      toast.success(result.message);
      setShowBanDialog(false);
      setBanReason("");
    } else {
      toast.error(result.message);
    }
  };

  const handleUnban = async (userId: string) => {
    const result = await unbanUser(userId);
    toast.success(result.message);
  };

  const handleImpersonate = async (userId: string) => {
    try {
      console.log("🎭 Initiating impersonation for user:", userId);

      // Step 1: Generate Golden Ticket
      const result = await createImpersonationSession(userId);

      if (!result.success || !result.token) {
        toast.error(result.message || "Failed to generate impersonation token");
        return;
      }

      console.log("✅ Golden Ticket received");

      // Step 2: Sign in using the impersonation provider
      const { signIn } = await import("next-auth/react");
      const signInResult = await signIn("impersonation", {
        token: result.token,
        callbackUrl: "/app",
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Failed to impersonate user");
        console.error("❌ Sign in error:", signInResult.error);
      } else if (signInResult?.ok) {
        toast.success(`Now logged in as ${result.targetUserName}`);

        // Redirect to user dashboard
        window.location.href = "/app";
      }
    } catch (error) {
      console.error("❌ Impersonation error:", error);
      toast.error("Something went wrong during impersonation");
    }
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={planFilter}
            onValueChange={(value: "all" | "pro" | "free") =>
              setPlanFilter(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value: "all" | "active" | "banned") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Oldest First
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">User & Email</TableHead>
              <TableHead className="text-center">Plan</TableHead>
              <TableHead className="text-center">Sites</TableHead>
              <TableHead className="text-center">Joined</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center">
                    <div>
                      <p className="font-medium">{user.name || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.isPro ? (
                      <Badge>Pro</Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {user._count.sites}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.bannedAt ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImpersonate(user.id)}
                        disabled={!!user.bannedAt}
                      >
                        <UserCog className="h-4 w-4 mr-1" />
                        Impersonate
                      </Button>
                      {user.bannedAt ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnban(user.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanDialog(true);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Ban User
            </DialogTitle>
            <DialogDescription>
              This will prevent the user from accessing the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for ban</Label>
              <Input
                id="reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Spam, abuse, TOS violation, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
