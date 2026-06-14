import { article01 } from "@/lib/blog/seo-articles/article-01-why-cv-matters";
import { article02 } from "@/lib/blog/seo-articles/article-02-ats-resume-guide";
import { article03 } from "@/lib/blog/seo-articles/article-03-ai-resume-builder";
import { article04 } from "@/lib/blog/seo-articles/article-04-instagram-marketing";
import { article05 } from "@/lib/blog/seo-articles/article-05-linkedin-strategy";
import { article06 } from "@/lib/blog/seo-articles/article-06-tiktok-marketing";
import { article07 } from "@/lib/blog/seo-articles/article-07-shopify-descriptions";
import { article08 } from "@/lib/blog/seo-articles/article-08-amazon-listings";
import { article09 } from "@/lib/blog/seo-articles/article-09-ai-content-workflow";
import { article10 } from "@/lib/blog/seo-articles/article-10-freelancer-guide";
import { article11 } from "@/lib/blog/seo-articles/article-11-video-ad-hooks";
import { article12 } from "@/lib/blog/seo-articles/article-12-video-ad-script-guide";
import { article13 } from "@/lib/blog/seo-articles/article-13-tiktok-reels-ecommerce-scripts";
import { article14 } from "@/lib/blog/seo-articles/article-14-ai-video-ad-scripts";
import type { BlogPost } from "@/types";

export const SEO_BLOG_ARTICLES: BlogPost[] = [
  article01,
  article02,
  article03,
  article04,
  article05,
  article06,
  article07,
  article08,
  article09,
  article10,
  article11,
  article12,
  article13,
  article14,
].sort(
  (a, b) =>
    new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
);
