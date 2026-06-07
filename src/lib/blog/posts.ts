import { createClient } from "@/lib/auth/supabase-server";
import { isSupabaseConfigured } from "@/lib/auth/env";
import type { BlogPost } from "@/types";

const QUERY_TIMEOUT_MS = 3000;

async function withQueryTimeout<T>(fn: () => Promise<T>): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase query timeout")), QUERY_TIMEOUT_MS)
    ),
  ]);
}

export const STATIC_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "complete-guide-ats-friendly-resumes-2026",
    title: "Complete Guide to ATS-Friendly Resumes in 2026",
    excerpt: "Learn how to format, keyword-optimize, and structure your resume to pass applicant tracking systems.",
    content: `# Complete Guide to ATS-Friendly Resumes in 2026

Applicant tracking systems (ATS) scan resumes before a human ever sees them. Here is how to win that first filter.

## Use a clean, single-column layout
Avoid tables, text boxes, and graphics that parsers cannot read.

## Match keywords from the job description
Mirror role-specific skills and tools naturally in your experience bullets.

## Standard section headings
Use **Experience**, **Education**, and **Skills** — not creative alternatives.

## Export as PDF with selectable text
Ensure your file is machine-readable, not a scanned image.`,
    category: "Resume Writing",
    author_id: null,
    status: "published",
    published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    seo_title: "ATS-Friendly Resume Guide 2026 | Novora",
    seo_description: "Step-by-step guide to writing ATS-friendly resumes that pass screening software in 2026.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "instagram-captions-that-convert",
    title: "How to Write Instagram Captions That Convert",
    excerpt: "Proven caption formulas, hooks, and CTAs to turn scrollers into customers.",
    content: `# How to Write Instagram Captions That Convert

Great visuals get attention. Great captions get action.

## Start with a hook
Open with a question, bold claim, or relatable pain point in the first line.

## Tell a micro-story
Three sentences of context build trust faster than a product pitch.

## End with one clear CTA
"Save this", "DM us", or "Link in bio" — pick one.`,
    category: "Social Media Marketing",
    author_id: null,
    status: "published",
    published_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    seo_title: "Instagram Captions That Convert | Novora",
    seo_description: "Learn caption formulas and CTAs that drive engagement and sales on Instagram.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    slug: "ai-product-descriptions-ecommerce",
    title: "AI Product Descriptions: The E-commerce Copy Guide",
    excerpt: "Write short, long, and SEO product descriptions that rank and sell.",
    content: `# AI Product Descriptions: The E-commerce Copy Guide

Product pages need three layers of copy: a punchy short description, a detailed long form, and an SEO meta description.`,
    category: "E-commerce Marketing",
    author_id: null,
    status: "published",
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    seo_title: "AI Product Descriptions for E-commerce | Novora",
    seo_description: "Guide to writing conversion-focused and SEO-optimized product descriptions with AI.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    slug: "50-social-media-hooks-small-business",
    title: "50 Social Media Hooks for Small Businesses",
    excerpt: "Copy-paste hooks for Instagram, LinkedIn, TikTok, and Facebook posts.",
    content: `# 50 Social Media Hooks for Small Businesses

Hooks stop the scroll. Here are fifty you can adapt today.`,
    category: "Social Media Marketing",
    author_id: null,
    status: "published",
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    seo_title: "50 Social Media Hooks for Small Business | Novora",
    seo_description: "Fifty proven social media hooks small businesses can use to boost engagement.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    slug: "linkedin-post-formula-2026",
    title: "The LinkedIn Post Formula That Works in 2026",
    excerpt: "Structure professional posts that build authority and drive profile visits.",
    content: `# The LinkedIn Post Formula That Works in 2026

## Line 1: Contrarian or insight hook
## Lines 2-4: Story or data point
## Lines 5-7: Actionable takeaway
## Line 8: Question to drive comments`,
    category: "Social Media Marketing",
    author_id: null,
    status: "published",
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    seo_title: "LinkedIn Post Formula 2026 | Novora",
    seo_description: "A proven LinkedIn post structure for professionals and founders in 2026.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    slug: "resume-keywords-by-industry",
    title: "Resume Keywords by Industry: What ATS Systems Look For",
    excerpt: "Industry-specific keyword lists for tech, healthcare, marketing, and finance roles.",
    content: `# Resume Keywords by Industry

ATS systems match resumes against job descriptions. Include relevant keywords naturally.`,
    category: "Resume Writing",
    author_id: null,
    status: "published",
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    seo_title: "Resume Keywords by Industry | Novora",
    seo_description: "Industry-specific ATS keywords for tech, marketing, healthcare, and finance resumes.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    slug: "ai-content-creation-workflow",
    title: "AI Content Creation Workflow for Solo Founders",
    excerpt: "A weekly system to plan, generate, and publish content without burnout.",
    content: `# AI Content Creation Workflow for Solo Founders

## Monday: Plan themes and offers
## Tuesday: Batch social captions
## Wednesday: Product copy updates
## Thursday: Blog draft
## Friday: Schedule and review analytics`,
    category: "AI Productivity",
    author_id: null,
    status: "published",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    seo_title: "AI Content Workflow for Founders | Novora",
    seo_description: "Weekly AI-powered content workflow for solo founders and small teams.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    slug: "etsy-product-description-tips",
    title: "Etsy Product Description Tips That Increase Sales",
    excerpt: "How to write Etsy listings that rank in search and convert browsers to buyers.",
    content: `# Etsy Product Description Tips That Increase Sales

## Front-load keywords in the first 160 characters
## Describe the buyer's moment
## Include size, materials, and care instructions`,
    category: "E-commerce Marketing",
    author_id: null,
    status: "published",
    published_at: new Date().toISOString(),
    seo_title: "Etsy Product Description Tips | Novora",
    seo_description: "Etsy listing copy tips to improve search ranking and conversion rates.",
    og_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return STATIC_BLOG_POSTS;

  try {
    const supabase = await createClient();
    const { data } = await withQueryTimeout(async () => {
      const result = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      return result;
    });

    if (data?.length) return data as BlogPost[];
    return STATIC_BLOG_POSTS;
  } catch {
    return STATIC_BLOG_POSTS;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fallback = STATIC_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const { data } = await withQueryTimeout(async () => {
      const result = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      return result;
    });

    if (data) return data as BlogPost;
    return fallback;
  } catch {
    return fallback;
  }
}
