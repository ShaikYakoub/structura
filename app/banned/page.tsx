import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>
            Your account has been suspended due to a violation of our terms of service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake or would like to appeal this decision,
              please contact our support team.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="mailto:support@shaikyakoub.com">
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
