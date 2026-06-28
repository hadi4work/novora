import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";
import { getAllSitemapBlogSlugs } from "@/lib/seo/sitemap-blog-slugs";

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
  { path: "/video-ad-script-generator", changeFrequency: "monthly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
];

function buildSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const blogSlugs = getAllSitemapBlogSlugs();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${APP_URL}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${APP_URL}/blog/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries];
}

export default function sitemap(): MetadataRoute.Sitemap {
  try {
    return buildSitemap();
  } catch {
    return STATIC_PAGES.map((page) => ({
      url: `${APP_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }));
  }
}
