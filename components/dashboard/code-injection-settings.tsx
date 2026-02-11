"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AlertTriangle, Code, Save, Loader2 } from "lucide-react";

interface CodeInjectionSettingsProps {
  siteId: string;
  initialData: {
    customHeadCode?: string | null;
    customBodyCode?: string | null;
    cookieBannerEnabled: boolean;
  };
}

export function CodeInjectionSettings({
  siteId,
  initialData,
}: CodeInjectionSettingsProps) {
  const [headCode, setHeadCode] = useState(initialData.customHeadCode || "");
  const [bodyCode, setBodyCode] = useState(initialData.customBodyCode || "");
  const [cookieBannerEnabled, setCookieBannerEnabled] = useState(
    initialData.cookieBannerEnabled,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/sites/${siteId}/code-injection`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customHeadCode: headCode || null,
          customBodyCode: bodyCode || null,
          cookieBannerEnabled,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Code injection settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Advanced Users Only</AlertTitle>
        <AlertDescription>
          Breaking or malicious code can crash your site or compromise security.
          Only add code from trusted sources.
        </AlertDescription>
      </Alert>

      {/* Head Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Head Code
          </CardTitle>
          <CardDescription>
            Code injected into the &lt;head&gt; section. Use for Google
            Analytics, Meta Pixel, or other tracking scripts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headCode">Custom Head Code</Label>
            <Textarea
              id="headCode"
              value={headCode}
              onChange={(e) => setHeadCode(e.target.value)}
              placeholder="<!-- Google Analytics -->
<script async src='https://www.googletagmanager.com/gtag/js?id=GA_ID'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>"
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Common use cases: Google Analytics, Google Tag Manager, Meta
              Pixel, custom fonts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Body Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Body Code
          </CardTitle>
          <CardDescription>
            Code injected before the closing &lt;/body&gt; tag. Use for chat
            widgets or deferred scripts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bodyCode">Custom Body Code</Label>
            <Textarea
              id="bodyCode"
              value={bodyCode}
              onChange={(e) => setBodyCode(e.target.value)}
              placeholder="<!-- Intercom Widget -->
<script>
  window.intercomSettings = {
    app_id: 'YOUR_APP_ID'
  };
  (function(){var w=window;var ic=w.Intercom;...})();
</script>"
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Common use cases: Intercom, Crisp, Tawk.to, custom widgets
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Banner Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Cookie Banner</CardTitle>
          <CardDescription>
            Show a cookie consent banner to comply with GDPR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="cookieBanner"
              checked={cookieBannerEnabled}
              onCheckedChange={setCookieBannerEnabled}
            />
            <Label htmlFor="cookieBanner">Enable Cookie Banner</Label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
}
