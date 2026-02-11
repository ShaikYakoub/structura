import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Showcase } from "@/components/marketing/showcase";
import { CTA } from "@/components/marketing/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Showcase />
      <Pricing />
      <CTA />
    </>
  );
}
