import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Showcase } from "@/components/marketing/showcase";
import { CTA } from "@/components/marketing/cta";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { SupportBubble } from "@/components/marketing/support-bubble";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Spacer for fixed navbar */}
      <div className="h-16" aria-hidden="true" />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <SupportBubble />
    </div>
  );
}
