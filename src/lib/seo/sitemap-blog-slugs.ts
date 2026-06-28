/** Lightweight slug list for sitemap — avoids importing full article bodies. */
export const SEO_BLOG_SLUGS = [
  "why-professional-cv-resume-matters-2026",
  "complete-ats-resume-optimization-guide-2026",
  "ai-resume-builder-vs-manual-cv-writing",
  "instagram-marketing-strategy-small-business-2026",
  "linkedin-content-strategy-for-professionals-2026",
  "tiktok-marketing-captions-hooks-viral-growth-2026",
  "shopify-product-descriptions-seo-conversion-guide",
  "amazon-product-listing-copy-seo-ranking-guide",
  "ai-content-creation-workflow-business-growth-2026",
  "freelancer-guide-cv-social-media-product-descriptions",
  "why-video-ad-hooks-matter-first-3-seconds",
  "video-ad-script-writing-guide-convert-2026",
  "tiktok-reels-video-ad-scripts-ecommerce-sellers",
  "ai-video-ad-script-generators-ecommerce-benefits",
  "ai-ad-script-generator-complete-guide-2026",
  "video-ad-script-generator-affiliates-ai-promo-platforms",
] as const;

/** Legacy slugs from supabase/seed.sql — still live when served from the database. */
export const LEGACY_BLOG_SLUGS = [
  "complete-guide-ats-friendly-resumes-2026",
  "instagram-captions-that-convert",
  "ai-product-descriptions-ecommerce",
  "50-social-media-hooks-small-business",
  "linkedin-post-formula-2026",
  "resume-keywords-by-industry",
  "ai-content-creation-workflow",
  "etsy-product-description-tips",
] as const;

export function getAllSitemapBlogSlugs(): string[] {
  return [...new Set([...SEO_BLOG_SLUGS, ...LEGACY_BLOG_SLUGS])];
}
