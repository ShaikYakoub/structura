"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TemplatePicker } from "@/components/dashboard/template-picker";
import {
  createSiteFromTemplate,
  checkSubdomainAvailability,
  type Template,
} from "@/app/actions/templates";
import { toast } from "sonner";
import {
  Briefcase,
  User,
  ShoppingBag,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    description: "Professional websites for companies and startups",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    icon: User,
    description: "Showcase your work and personal brand",
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    icon: ShoppingBag,
    description: "Online stores and product catalogs",
  },
  {
    id: "blog",
    name: "Blog",
    icon: FileText,
    description: "Content-focused websites and publications",
  },
];

type OnboardingStep = "category" | "template" | "customize" | "success";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [siteName, setSiteName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newSiteId, setNewSiteId] = useState<string>("");

  const progress = {
    category: 25,
    template: 50,
    customize: 75,
    success: 100,
  }[currentStep];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep("template");
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setSiteName(`My ${template.name}`);
    setSubdomain(`site-${Math.random().toString(36).substring(2, 8)}`);
    setCurrentStep("customize");
  };

  const handleCreateSite = async () => {
    if (!selectedTemplate || !siteName || !subdomain) return;

    setIsCreating(true);

    // Check subdomain availability
    const isAvailable = await checkSubdomainAvailability(subdomain);
    if (!isAvailable) {
      toast.error("Subdomain is already taken. Please try another.");
      setIsCreating(false);
      return;
    }

    // Get tenant ID from session/auth
    const tenantId = "tenant-id-placeholder"; // Replace with actual tenant ID

    // Clone template
    const result = await createSiteFromTemplate(
      selectedTemplate.id,
      tenantId,
      siteName,
      subdomain,
    );

    if (result.success && result.siteId) {
      setNewSiteId(result.siteId);
      setCurrentStep("success");
      toast.success("Your site has been created!");
    } else {
      toast.error(result.error || "Failed to create site");
    }

    setIsCreating(false);
  };

  const handleGoToEditor = () => {
    router.push(`/app/site/${newSiteId}/editor`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Your Site</h1>
          <p className="text-muted-foreground">
            Follow these simple steps to launch your website in minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span
              className={
                currentStep === "category" ? "text-primary font-medium" : ""
              }
            >
              Choose Category
            </span>
            <span
              className={
                currentStep === "template" ? "text-primary font-medium" : ""
              }
            >
              Pick Template
            </span>
            <span
              className={
                currentStep === "customize" ? "text-primary font-medium" : ""
              }
            >
              Customize
            </span>
            <span
              className={
                currentStep === "success" ? "text-primary font-medium" : ""
              }
            >
              Done
            </span>
          </div>
        </div>

        {/* Step: Category Selection */}
        {currentStep === "category" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              What kind of site are you building?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary bg-card"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>{category.name}</CardTitle>
                      </div>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Template Selection */}
        {currentStep === "template" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Choose a Template</h2>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("category")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <TemplatePicker
              onSelectTemplate={handleTemplateSelect}
              selectedCategory={selectedCategory}
            />
          </div>
        )}

        {/* Step: Customize */}
        {currentStep === "customize" && selectedTemplate && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Customize Your Site</h2>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("template")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Site Details</CardTitle>
                <CardDescription>
                  Give your site a name and choose a subdomain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Site Name */}
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="My Awesome Site"
                  />
                </div>

                {/* Subdomain */}
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="flex gap-2">
                    <Input
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) =>
                        setSubdomain(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        )
                      }
                      placeholder="my-site"
                      className="font-mono"
                    />
                    <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                      .localhost:3000
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only lowercase letters, numbers, and hyphens
                  </p>
                </div>

                {/* Selected Template Info */}
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-1">Selected Template</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.name}
                  </p>
                </div>

                {/* Create Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreateSite}
                  disabled={isCreating || !siteName || !subdomain}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Your Site...
                    </>
                  ) : (
                    <>
                      Create Site
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Success */}
        {currentStep === "success" && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">
                Your Site is Ready! 🎉
              </h2>
              <p className="text-muted-foreground">
                Your site has been created successfully. Start editing to make
                it your own.
              </p>
            </div>

            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Site Name</p>
                    <p className="text-sm text-muted-foreground">{siteName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Your URL</p>
                    <a
                      href={`http://${subdomain}.localhost:3000`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {subdomain}.localhost:3000
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/app")}
              >
                Go to Dashboard
              </Button>
              <Button className="flex-1" onClick={handleGoToEditor}>
                Start Editing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
