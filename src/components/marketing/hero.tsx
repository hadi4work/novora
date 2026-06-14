"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";

export function Hero() {
  const { t } = useTranslations("marketing");
  const { t: tc } = useTranslations("common");

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="mx-auto max-w-6xl px-4 text-center">
        <HeroLogo />
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("heroBadge")}
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t("heroSubtitle")}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-foreground/90 md:text-lg">
          {t("heroMonthlyUsers")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/signup">
              {t("startFree")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/features">{tc("learnMore")}</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("heroNote")}
        </p>
      </div>
    </section>
  );
}
