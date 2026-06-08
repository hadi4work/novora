import type { BlogPost } from "@/types";

let articleCounter = 100;

export function createBlogArticle(
  article: Omit<
    BlogPost,
    | "id"
    | "author_id"
    | "status"
    | "created_at"
    | "updated_at"
    | "og_image_url"
    | "published_at"
  > & { daysAgo?: number }
): BlogPost {
  const now = new Date();
  const { daysAgo = 0, ...rest } = article;

  return {
    ...rest,
    id: String(++articleCounter),
    author_id: null,
    status: "published",
    og_image_url: null,
    published_at: new Date(now.getTime() - daysAgo * 86400000).toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}
