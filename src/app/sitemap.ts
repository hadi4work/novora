import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";
import { getSitemapPosts } from "@/lib/seo/sitemap-posts";

export const revalidate = 86400;

const STATIC_PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/social-media-generator", changeFrequency: "monthly", priority: 0.9 },
  { path: "/product-description-generator", changeFrequency: "monthly", priority: 0.9 },
  { path: "/resume-builder", changeFrequency: "monthly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
];

function toLastModified(value: string | null | undefined): Date {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSitemapPosts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${APP_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: toLastModified(post.updated_at ?? post.published_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries];
}
