import { ToolLanding } from "@/components/marketing/tool-landing";
import { createMetadata } from "@/lib/seo/metadata";

const faqs = [
  {
    question: "Which platforms are supported?",
    answer: "Instagram, Facebook, TikTok, LinkedIn, and X — all available on every plan.",
  },
  {
    question: "What do I get per generation?",
    answer: "Multiple caption variations, relevant hashtags, marketing hooks, and call-to-action suggestions.",
  },
  {
    question: "Is it free?",
    answer: "Yes — 3 free generations per day. Upgrade to Pro for unlimited access.",
  },
];

export const metadata = createMetadata({
  title: "AI Social Media Post Generator",
  description: "Generate Instagram, LinkedIn, TikTok, Facebook, and X posts with AI. Captions, hashtags, and CTAs in seconds.",
  path: "/social-media-generator",
  keywords: ["AI social media generator", "Instagram captions", "LinkedIn posts", "TikTok captions"],
});

export default function SocialMediaGeneratorPage() {
  return (
    <ToolLanding
      title="AI Social Media Generator"
      description="Create engaging captions, hashtags, hooks, and CTAs for every major platform. Tailored to your business, audience, and goals."
      path="/social-media-generator"
      features={[
        "Instagram, Facebook, TikTok, LinkedIn, and X",
        "Multiple caption variations per generation",
        "Hashtag and CTA suggestions",
        "Platform-specific tone and formatting",
        "Copy to clipboard instantly",
      ]}
      faqs={faqs}
      ctaHref="/app/social-media"
    />
  );
}
