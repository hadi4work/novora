import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FeaturesPageCta, FeaturesPageHeader } from "@/components/marketing/features-page-content";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Features",
  description: "Explore Novora AI tools: social media generator, product descriptions, and resume builder.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <Breadcrumbs items={[{ name: "Features", href: "/features" }]} />
        <FeaturesPageHeader />
      </div>
      <FeatureGrid />
      <FeaturesPageCta />
    </div>
  );
}
