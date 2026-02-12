import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Showcase } from "@/components/marketing/showcase";
import { CTA } from "@/components/marketing/cta";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { SupportBubble } from "@/components/marketing/support-bubble";
import { IntroAnimation } from "@/components/ui/intro-animation";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <IntroAnimation />
      <Navbar />
      {/* Spacer for fixed navbar */}
      <div className="h-16" aria-hidden="true" />
      <main className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="max-w-7xl mx-auto">
          <Hero />
          <Features />
          <Showcase />
          <Pricing />
          <CTA />
        </div>
      </main>
      <Footer />
      <SupportBubble />
    </div>
  );
}
