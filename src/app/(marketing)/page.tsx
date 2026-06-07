import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HomePricingSection } from "@/components/marketing/home-pricing-section";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "AI Content Platform for Creators & Businesses",
  description:
    "Create social media posts, product descriptions, and professional resumes with AI. Free to start — 3 generations per day.",
  path: "/",
  keywords: ["AI content", "social media generator", "resume builder", "product descriptions"],
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HomePricingSection />
    </>
  );
}
