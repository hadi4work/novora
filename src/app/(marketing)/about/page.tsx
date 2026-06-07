import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "About",
  description: `Learn about ${APP_NAME} — ${APP_TAGLINE} AI content platform for creators and businesses.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ name: "About", href: "/about" }]} />
      <h1 className="text-4xl font-bold tracking-tight">About {APP_NAME}</h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        {APP_NAME} is an AI-powered platform built to help content creators, small business owners,
        e-commerce sellers, freelancers, and job seekers create better content in less time.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Our mission is simple: {APP_TAGLINE}. We believe powerful AI tools should be accessible to
        everyone — which is why we offer a generous free tier and affordable Pro plans.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { stat: "3", label: "AI tools" },
          { stat: "5", label: "Social platforms" },
          { stat: "3", label: "Resume templates" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border p-6 text-center">
            <div className="text-3xl font-bold text-primary">{item.stat}</div>
            <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
