import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MessageCircle,
  Phone,
  HelpCircle,
  Settings as SettingsIcon,
  Shield,
  Database,
  Users,
} from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-muted-foreground">
          Platform configuration and administrative settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">System Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Manage platform-wide settings and configurations
              </p>
            </div>
            <Button variant="outline" className="w-full justify-start">
              <Database className="mr-2 h-4 w-4" />
              Database Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">User Administration</h4>
              <p className="text-sm text-muted-foreground">
                Manage user accounts, permissions, and access controls
              </p>
            </div>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Permission Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <HelpCircle className="h-5 w-5" />
            Support & Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-4">
            Need assistance with platform administration or have technical
            questions? Our support team is here to help.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              asChild
            >
              <a href="mailto:support@structura.com">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              asChild
            >
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              asChild
            >
              <a href="tel:+1234567890">
                <Phone className="mr-2 h-4 w-4" />
                Call Support
              </a>
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-blue-600 text-center">
              Response time: Typically within 2 hours for admin support
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
