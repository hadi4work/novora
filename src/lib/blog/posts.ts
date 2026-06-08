import { createClient } from "@/lib/auth/supabase-server";
import { isSupabaseConfigured } from "@/lib/auth/env";
import { SEO_BLOG_ARTICLES } from "@/lib/blog/seo-articles";
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

function mergeWithCanonical(dbPosts: BlogPost[]): BlogPost[] {
  const canonicalSlugs = new Set(SEO_BLOG_ARTICLES.map((p) => p.slug));
  const dbOnly = dbPosts.filter((p) => !canonicalSlugs.has(p.slug));
  return [...SEO_BLOG_ARTICLES, ...dbOnly].sort(
    (a, b) =>
      new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
  );
}

export const STATIC_BLOG_POSTS = SEO_BLOG_ARTICLES;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return SEO_BLOG_ARTICLES;

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

    if (data?.length) return mergeWithCanonical(data as BlogPost[]);
    return SEO_BLOG_ARTICLES;
  } catch {
    return SEO_BLOG_ARTICLES;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const canonical = SEO_BLOG_ARTICLES.find((p) => p.slug === slug) ?? null;
  if (!isSupabaseConfigured()) return canonical;

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

    return canonical ?? (data as BlogPost | null);
  } catch {
    return canonical;
  }
}
