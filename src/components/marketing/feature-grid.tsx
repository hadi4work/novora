"use client";

import Link from "next/link";
import { FileText, Share2, ShoppingBag, Clapperboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";

const featureMeta = [
  { key: "social" as const, icon: Share2, href: "/social-media-generator" },
  { key: "product" as const, icon: ShoppingBag, href: "/product-description-generator" },
  { key: "video" as const, icon: Clapperboard, href: "/video-ad-script-generator" },
  { key: "resume" as const, icon: FileText, href: "/resume-builder" },
];

export function FeatureGrid() {
  const { messages } = useLocale();
  const { t } = useTranslations("marketing");

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("toolsTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t("featuresSubtitle")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureMeta.map((feature) => {
            const data = messages.marketing.tools[feature.key];
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>{data.title}</CardTitle>
                    <CardDescription>{data.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-primary font-medium">
                      {t("learnMoreArrow")}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
