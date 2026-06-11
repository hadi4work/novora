export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function websiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Novora",
    url: baseUrl,
    description:
      "AI-powered content tools for creators, businesses, and job seekers.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Novora",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/logo.png`,
    slogan: "Create. Grow. Succeed.",
    sameAs: [],
  };
}

export function webApplicationJsonLd(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string | null;
  slug: string;
  published_at: string | null;
  category: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${baseUrl}/blog/${post.slug}`,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Novora" },
    publisher: { "@type": "Organization", name: "Novora" },
    articleSection: post.category,
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.href}`,
    })),
  };
}
