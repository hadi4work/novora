import type { FetchedProduct } from "@/lib/validations/video-ad-script";

const ALLOWED_HOST_PATTERNS = [
  /(^|\.)amazon\./i,
  /(^|\.)amzn\./i,
  /(^|\.)temu\.com$/i,
  /(^|\.)aliexpress\./i,
  /(^|\.)ebay\./i,
  /(^|\.)etsy\.com$/i,
  /(^|\.)shopify\.com$/i,
  /(^|\.)walmart\.com$/i,
  /(^|\.)shein\./i,
  /(^|\.)noon\.com$/i,
];

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractMetaContent(html: string, key: string, attr: "property" | "name" = "property") {
  const patterns = [
    new RegExp(
      `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return null;
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? decodeHtml(match[1]) : null;
}

function extractJsonLdProduct(html: string) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (item?.["@type"] === "Product") return item;
        if (Array.isArray(item?.["@graph"])) {
          const product = item["@graph"].find(
            (node: { ["@type"]?: string }) => node?.["@type"] === "Product"
          );
          if (product) return product;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

function isAllowedProductUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

export async function fetchProductFromUrl(url: string): Promise<FetchedProduct> {
  if (!isAllowedProductUrl(url)) {
    throw new Error(
      "Unsupported product URL. Use Amazon, Temu, AliExpress, eBay, Etsy, Shopify, Walmart, Shein, or Noon."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NovoraBot/1.0; +https://novora-ai.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not access this product page. Try manual input instead.");
    }

    const html = await response.text();
    const jsonLd = extractJsonLdProduct(html);

    const productName =
      (jsonLd?.name as string | undefined) ??
      extractMetaContent(html, "og:title") ??
      extractMetaContent(html, "twitter:title", "name") ??
      extractTitle(html);

    const description =
      (jsonLd?.description as string | undefined) ??
      extractMetaContent(html, "og:description") ??
      extractMetaContent(html, "description", "name") ??
      extractMetaContent(html, "twitter:description", "name");

    const imageUrl =
      (Array.isArray(jsonLd?.image) ? jsonLd.image[0] : jsonLd?.image) ??
      extractMetaContent(html, "og:image") ??
      undefined;

    if (!productName && !description) {
      throw new Error(
        "Could not extract product details from this URL. Try manual input or another link."
      );
    }

    const features = [
      description,
      imageUrl ? `Product image: ${imageUrl}` : null,
      `Imported from: ${url}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      productName: productName ?? "Imported product",
      productFeatures: features.slice(0, 3000),
      imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
      sourceUrl: url,
    };
  } finally {
    clearTimeout(timeout);
  }
}
