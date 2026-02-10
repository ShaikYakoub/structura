"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, ContactFormState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, Mail, User, MessageSquare } from "lucide-react";

interface ContactFormProps {
  data: {
    title?: string;
    subtitle?: string;
    successMessage?: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Send Message
        </>
      )}
    </Button>
  );
}

export function ContactForm({ data }: ContactFormProps) {
  const { 
    title = "Get in Touch", 
    subtitle = "We'd love to hear from you",
    successMessage = "Thank you for your message! We'll get back to you soon."
  } = data;

  const initialState: ContactFormState = {};
  const [state, formAction] = useActionState(submitContactForm, initialState);

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{title}</CardTitle>
            {subtitle && (
              <CardDescription className="text-base">{subtitle}</CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {state?.success ? (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {successMessage}
                </AlertDescription>
              </Alert>
            ) : (
              <form action={formAction} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className={state?.errors?.name ? "border-destructive" : ""}
                  />
                  {state?.errors?.name && (
                    <p className="text-sm text-destructive">{state.errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className={state?.errors?.email ? "border-destructive" : ""}
                  />
                  {state?.errors?.email && (
                    <p className="text-sm text-destructive">{state.errors.email}</p>
                  )}
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    required
                    className={state?.errors?.message ? "border-destructive" : ""}
                  />
                  {state?.errors?.message && (
                    <p className="text-sm text-destructive">{state.errors.message}</p>
                  )}
                </div>

                <SubmitButton />
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
