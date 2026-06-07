import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQ } from "@/components/marketing/faq";
import { JsonLd, faqJsonLd, webApplicationJsonLd } from "@/components/seo/json-ld";
import { AdUnit } from "@/components/ads/adsense";
import { APP_URL } from "@/lib/constants";

interface ToolLandingProps {
  title: string;
  description: string;
  path: string;
  features: string[];
  faqs: { question: string; answer: string }[];
  ctaHref: string;
  ctaLabel?: string;
}

export function ToolLanding({
  title,
  description,
  path,
  features,
  faqs,
  ctaHref,
  ctaLabel = "Try it free",
}: ToolLandingProps) {
  const breadcrumbName = title.replace("AI ", "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={webApplicationJsonLd(title, description, `${APP_URL}${path}`)} />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={[{ name: breadcrumbName, href: path }]} />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          <ul className="mt-8 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link href={ctaHref}>
              {ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-8">
          <div className="space-y-4">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
            <div className="mt-6 rounded-lg border bg-background p-4">
              <p className="text-sm text-muted-foreground mb-2">Generated output preview</p>
              <p className="text-sm">
                Professional AI-generated content tailored to your business, audience, and goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AdUnit slot="tool-landing" format="horizontal" className="mt-16" />

      <section className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
        <FAQ items={faqs} />
      </section>
    </div>
  );
}
