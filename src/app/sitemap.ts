import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { APP_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const staticPages = [
    "",
    "/pricing",
    "/features",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/social-media-generator",
    "/product-description-generator",
    "/resume-builder",
    "/blog",
    "/login",
    "/signup",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.includes("generator") || path === "/resume-builder" ? 0.9 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries];
}
