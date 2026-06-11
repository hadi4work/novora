import { createServiceClient } from "@/lib/auth/supabase-server";
import { isSupabaseConfigured } from "@/lib/auth/env";
import { SEO_BLOG_ARTICLES } from "@/lib/blog/seo-articles";
import type { BlogPost } from "@/types";

function mergeWithCanonical(dbPosts: Pick<BlogPost, "slug" | "updated_at" | "published_at">[]) {
  const canonicalSlugs = new Set(SEO_BLOG_ARTICLES.map((post) => post.slug));
  const dbOnly = dbPosts.filter((post) => !canonicalSlugs.has(post.slug));

  return [
    ...SEO_BLOG_ARTICLES.map((post) => ({
      slug: post.slug,
      updated_at: post.updated_at,
      published_at: post.published_at,
    })),
    ...dbOnly,
  ];
}

export async function getSitemapPosts(): Promise<
  Pick<BlogPost, "slug" | "updated_at" | "published_at">[]
> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return SEO_BLOG_ARTICLES.map((post) => ({
      slug: post.slug,
      updated_at: post.updated_at,
      published_at: post.published_at,
    }));
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data?.length) {
      return SEO_BLOG_ARTICLES.map((post) => ({
        slug: post.slug,
        updated_at: post.updated_at,
        published_at: post.published_at,
      }));
    }

    return mergeWithCanonical(data);
  } catch {
    return SEO_BLOG_ARTICLES.map((post) => ({
      slug: post.slug,
      updated_at: post.updated_at,
      published_at: post.published_at,
    }));
  }
}
