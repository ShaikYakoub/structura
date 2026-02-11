"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { UserCog, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { banUser, unbanUser, createImpersonationSession } from "@/app/actions/admin";

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
    const result = await createImpersonationSession(userId);
    
    if (result.success) {
      toast.success("Impersonation logged. Opening dashboard...");
      // In production, implement proper session switching
      console.log("🔒 Impersonation session created for user:", userId);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {user.isPro ? (
                    <Badge>Pro</Badge>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </TableCell>
                <TableCell>{user._count.sites}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.bannedAt ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
            ))}
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
