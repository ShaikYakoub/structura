"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
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
        <motion.div
          className="mb-12 text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Create Your Site
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Follow these simple steps to launch your website in minutes
          </p>
        </motion.div>

        {/* Animated Step Indicators */}
        <div className="mb-12">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {[
                { step: "category", label: "Choose Category", icon: Briefcase },
                { step: "template", label: "Pick Template", icon: FileText },
                { step: "customize", label: "Customize", icon: User },
                { step: "success", label: "Done", icon: CheckCircle2 },
              ].map((stepInfo, index) => {
                const Icon = stepInfo.icon;
                const isActive = currentStep === stepInfo.step;
                const isCompleted =
                  ["category", "template", "customize", "success"].indexOf(
                    currentStep,
                  ) > index;

                return (
                  <div key={stepInfo.step} className="flex items-center">
                    <motion.div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted border-muted-foreground/20 text-muted-foreground"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <motion.div
                      className="ml-3 hidden sm:block"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <p
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-primary"
                            : isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stepInfo.label}
                      </p>
                    </motion.div>
                    {index < 3 && (
                      <motion.div
                        className="mx-2 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isCompleted ? 1 : 0.3,
                          scale: isCompleted ? 1 : 0.8,
                        }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.2 }}
                      >
                        <ChevronRight
                          className={`h-5 w-5 ${
                            isCompleted
                              ? "text-green-500"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step: Category Selection */}
        <AnimatePresence mode="wait">
          {currentStep === "category" && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-primary">
                  What kind of site are you building?
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Choose a category that best describes your project. We'll show
                  you templates tailored to your needs.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {CATEGORIES.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-primary/50 bg-card group h-full"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <CardHeader className="pb-4 flex flex-col h-full">
                          <div className="flex items-center gap-4 flex-grow">
                            <motion.div
                              className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300"
                              whileHover={{ rotate: 5 }}
                            >
                              <Icon className="h-7 w-7 text-primary" />
                            </motion.div>
                            <div className="flex-grow">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {category.name}
                              </CardTitle>
                              <CardDescription className="text-base">
                                {category.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step: Template Selection */}
        <AnimatePresence mode="wait">
          {currentStep === "template" && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Choose a Template
                  </h2>
                  <p className="text-muted-foreground">
                    Pick a design that matches your vision
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep("category")}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
              <TemplatePicker
                onSelectTemplate={handleTemplateSelect}
                selectedCategory={selectedCategory}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step: Customize */}
        <AnimatePresence mode="wait">
          {currentStep === "customize" && selectedTemplate && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Customize Your Site
                  </h2>
                  <p className="text-muted-foreground">
                    Give your site a name and choose a unique subdomain
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep("template")}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl">Site Details</CardTitle>
                    <CardDescription className="text-base">
                      Give your site a name and choose a subdomain
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Site Name */}
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label htmlFor="siteName" className="text-sm font-medium">
                        Site Name
                      </Label>
                      <Input
                        id="siteName"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="My Awesome Site"
                        className="h-12 text-base"
                      />
                    </motion.div>

                    {/* Subdomain */}
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label
                        htmlFor="subdomain"
                        className="text-sm font-medium"
                      >
                        Subdomain
                      </Label>
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
                          className="font-mono h-12 text-base"
                        />
                        <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap bg-muted px-3 rounded-md border">
                          .localhost:3000
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Only lowercase letters, numbers, and hyphens
                      </p>
                    </motion.div>

                    {/* Selected Template Info */}
                    <motion.div
                      className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-sm font-medium mb-2 text-primary">
                        Selected Template
                      </p>
                      <p className="text-base font-semibold">
                        {selectedTemplate.name}
                      </p>
                    </motion.div>

                    {/* Create Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                        onClick={handleCreateSite}
                        disabled={isCreating || !siteName || !subdomain}
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Your Site...
                          </>
                        ) : (
                          <>
                            Create Site
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step: Success */}
        <AnimatePresence mode="wait">
          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              >
                <div className="p-6 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 shadow-lg">
                  <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Your Site is Ready! 🎉
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Your site has been created successfully. Start editing to make
                  it your own.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-card shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="pt-8 pb-8">
                    <div className="space-y-6">
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Site Name
                        </p>
                        <p className="text-xl font-semibold">{siteName}</p>
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Your URL
                        </p>
                        <a
                          href={`http://${subdomain}.localhost:3000`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl text-primary hover:text-primary/80 font-mono hover:underline transition-colors"
                        >
                          {subdomain}.localhost:3000
                        </a>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="flex gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium hover:bg-primary/5 transition-all duration-300"
                  onClick={() => router.push("/app")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleGoToEditor}
                >
                  Start Editing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
