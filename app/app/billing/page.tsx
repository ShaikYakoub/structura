import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/animated-button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 3 sites",
      "Basic templates",
      "Community support",
      "Structura branding",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For growing businesses and creators",
    features: [
      "Unlimited sites",
      "Premium templates",
      "Custom domain support",
      "Priority support",
      "Remove Structura branding",
      "Advanced analytics",
    ],
    buttonText: "Upgrade to Pro",
    buttonVariant: "default" as const,
    iconName: "Crown",
    popular: true,
  },
];

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Upgrade to Pro to unlock unlimited sites and premium features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-6 -right-6 bg-white/20 backdrop-blur-lg border border-white/30 text-primary px-3 py-1.5 rounded-full text-xs font-medium shadow-xl z-10">
                Most Popular ✨
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6 px-6">
                {plan.name === "Free" ? (
                  <AnimatedButton
                    animationType="none"
                    className="w-full border-2 opacity-50 cursor-not-allowed py-3"
                    disabled
                  >
                    {plan.buttonText}
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    asChild
                    animationType="bounce"
                    iconName={plan.iconName}
                    className="w-full border-2 bg-gradient-to-r from-black via-gray-900 to-gray-800 hover:from-gray-900 hover:via-black hover:to-gray-900 text-white py-3"
                    size="lg"
                  >
                    <Link href="/api/billing/create-subscription">
                      {plan.buttonText}
                    </Link>
                  </AnimatedButton>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Need help choosing?{" "}
          <Link href="/docs" className="text-primary underline">
            Visit our Documentation
          </Link>
        </p>
      </div>
    </div>
  );
}