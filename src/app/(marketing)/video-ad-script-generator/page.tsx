import { ToolLanding } from "@/components/marketing/tool-landing";
import { createMetadata } from "@/lib/seo/metadata";

const faqs = [
  {
    question: "Can I import products from Amazon or Temu?",
    answer:
      "Yes. Pro users can paste a product URL from Amazon, Temu, AliExpress, eBay, Etsy, and more. Novora extracts product details and builds a video ad script automatically.",
  },
  {
    question: "Does the script include timestamps?",
    answer:
      "Every line includes start and end seconds, plus visual suggestions for what to show on screen — ready for TikTok, Reels, Shorts, and YouTube ads.",
  },
  {
    question: "Can I turn the script into a product description?",
    answer:
      "Yes. After generating a script, use the one-click button to send the product data to the Product Description Generator.",
  },
];

export const metadata = createMetadata({
  title: "AI Video Ad Script Generator",
  description:
    "Create scroll-stopping video ad scripts with hooks, timestamps, and B-roll ideas. Import from Amazon, Temu, and more.",
  path: "/video-ad-script-generator",
  keywords: [
    "video ad script generator",
    "TikTok ad script",
    "product video script AI",
    "Amazon product ad",
  ],
});

export default function VideoAdScriptGeneratorPage() {
  return (
    <ToolLanding
      title="AI Video Ad Script Generator"
      description="Turn any product into a professional video ad script. Hooks, timed voiceover lines, visual cues, and CTA — optimized for TikTok, Reels, Shorts, and YouTube."
      path="/video-ad-script-generator"
      features={[
        "Full video scripts with second-by-second timing",
        "Scroll-stopping hooks and CTA",
        "Visual & B-roll suggestions per line",
        "Import products from Amazon, Temu & more (Pro)",
        "One-click handoff to Product Description Generator",
        "Platform presets: TikTok, Reels, Shorts, YouTube",
      ]}
      faqs={faqs}
      ctaHref="/app/video-ad-script"
    />
  );
}
