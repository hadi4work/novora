import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE, APP_URL } from "@/lib/constants";

export function createMetadata(params: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
}): Metadata {
  const url = `${APP_URL}${params.path}`;

  return {
    title: `${params.title} | ${APP_NAME}`,
    description: params.description,
    keywords: params.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: APP_NAME,
      type: "website",
      images: [{ url: params.ogImage ?? `${APP_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: [params.ogImage ?? `${APP_URL}/opengraph-image`],
    },
  };
}

export const defaultMetadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "AI-powered content tools for creators, businesses, and job seekers. Generate social media posts, product descriptions, and professional resumes.",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/icon.png" }],
  },
};
