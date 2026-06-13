import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, articleJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdsterraRectangle } from "@/components/ads/adsterra";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog/posts";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return createMetadata({
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? "",
    path: `/blog/${post.slug}`,
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

function renderMarkdown(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("# ")) {
      return (
        <h1 key={i} className="text-3xl font-bold mt-8 mb-4">
          {renderInline(line.slice(2))}
        </h1>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="text-2xl font-bold mt-6 mb-3">
          {renderInline(line.slice(3))}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="text-xl font-semibold mt-5 mb-2">
          {renderInline(line.slice(4))}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="mb-2 ms-5 list-disc leading-relaxed text-muted-foreground">
          {renderInline(line.slice(2))}
        </li>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={i} className="mb-2 ms-5 list-decimal leading-relaxed text-muted-foreground">
          {renderInline(line.replace(/^\d+\.\s/, ""))}
        </li>
      );
    }
    if (line.startsWith("---")) return <hr key={i} className="my-8" />;
    if (line.trim() === "") return null;
    return (
      <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
        {renderInline(line)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={articleJsonLd(post)} />
      <Breadcrumbs items={[
        { name: "Blog", href: "/blog" },
        { name: post.title, href: `/blog/${post.slug}` },
      ]} />
      <Badge variant="secondary" className="mb-4">{post.category}</Badge>
      <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
      <time className="mt-4 block text-sm text-muted-foreground">
        {post.published_at
          ? new Date(post.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </time>

      <div className="mt-8">{renderMarkdown(post.content)}</div>

      <AdsterraRectangle className="my-8" />

      <div className="mt-12 rounded-lg border bg-muted/30 p-6 text-center">
        <h3 className="font-semibold text-lg">Try Novora free</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate social posts, product descriptions, and resumes with AI.
        </p>
        <Button asChild className="mt-4">
          <Link href="/signup">Get started free</Link>
        </Button>
      </div>
    </article>
  );
}
