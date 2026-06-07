import { ToolLanding } from "@/components/marketing/tool-landing";
import { createMetadata } from "@/lib/seo/metadata";

const faqs = [
  {
    question: "What description formats are available?",
    answer: "Short descriptions, long-form copy, and SEO meta descriptions. Free plan includes short only; Pro unlocks all formats.",
  },
  {
    question: "Is the content SEO-optimized?",
    answer: "Yes. Pro users get SEO titles, meta descriptions, and keyword suggestions optimized for search.",
  },
  {
    question: "Can I use this for Etsy or Amazon?",
    answer: "Absolutely. Our descriptions work for any e-commerce platform or marketplace.",
  },
];

export const metadata = createMetadata({
  title: "AI Product Description Generator",
  description: "Generate short, long, and SEO product descriptions for e-commerce. Conversion-focused AI copy in seconds.",
  path: "/product-description-generator",
  keywords: ["AI product description", "e-commerce copy", "SEO product descriptions"],
});

export default function ProductDescriptionPage() {
  return (
    <ToolLanding
      title="AI Product Description Generator"
      description="Write conversion-focused product copy for your store. Short descriptions, detailed listings, and SEO meta — all powered by AI."
      path="/product-description-generator"
      features={[
        "Short, long, and SEO description formats",
        "Conversion-focused marketing copy",
        "SEO title and meta description",
        "Keyword suggestions",
        "E-commerce tone presets",
      ]}
      faqs={faqs}
      ctaHref="/app/product-description"
    />
  );
}
