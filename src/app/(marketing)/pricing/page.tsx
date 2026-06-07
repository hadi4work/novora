import { PricingPageContent } from "@/components/marketing/pricing-page-content";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, faqJsonLd } from "@/components/seo/json-ld";
import { getServerTranslations } from "@/lib/i18n/server";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Pricing",
  description: "Novora pricing plans. Start free with 3 daily generations. Pro at $15/mo, Business at $49/mo.",
  path: "/pricing",
});

export default async function PricingPage() {
  const { messages } = await getServerTranslations();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={faqJsonLd(messages.pricing.faqs)} />
      <Breadcrumbs items={[{ name: "Pricing", href: "/pricing" }]} />
      <PricingPageContent />
    </div>
  );
}
