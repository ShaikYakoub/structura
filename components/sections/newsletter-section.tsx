"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeToNewsletter, NewsletterState } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";

interface NewsletterSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    disclaimer?: string;
  };
}

function SubmitButton({ buttonText }: { buttonText: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size="lg" className="shrink-0">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      {buttonText}
    </Button>
  );
}

export function NewsletterSection({ data }: NewsletterSectionProps) {
  const {
    title = "Subscribe to Our Newsletter",
    subtitle = "Get the latest updates and news delivered to your inbox",
    buttonText = "Subscribe",
    disclaimer = "No spam, unsubscribe anytime",
  } = data;

  const initialState: NewsletterState = {};
  const [state, formAction] = useActionState(subscribeToNewsletter, initialState);

  return (
    <section className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          {title && <h2 className="text-3xl font-bold mb-3">{title}</h2>}
          {subtitle && <p className="text-lg opacity-90">{subtitle}</p>}
        </div>

        {state?.success ? (
          <Alert className="bg-green-500 border-green-600 text-white max-w-2xl mx-auto">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{state.success}</AlertDescription>
          </Alert>
        ) : (
          <form action={formAction} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 bg-background text-foreground h-12"
              />
              <SubmitButton buttonText={buttonText} />
            </div>

            {state?.error && (
              <p className="text-sm text-red-200 mt-2">{state.error}</p>
            )}

            {disclaimer && (
              <p className="text-sm text-center mt-4 opacity-75">{disclaimer}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
