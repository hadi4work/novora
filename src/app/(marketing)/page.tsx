import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HomePricingSection } from "@/components/marketing/home-pricing-section";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { TrustedByMarquee } from "@/components/marketing/trusted-by-marquee";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "AI Content Platform for Creators & Businesses",
  description:
    "Create social media posts, product descriptions, and professional resumes with AI. Trusted by 50,000+ monthly users. Free to start — 3 generations per day.",
  path: "/",
  keywords: ["AI content", "social media generator", "resume builder", "product descriptions"],
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedByMarquee />
      <FeatureGrid />
      <TestimonialsCarousel />
      <HomePricingSection />
    </>
  );
}
