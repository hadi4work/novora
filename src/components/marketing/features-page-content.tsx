"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";

export function FeaturesPageHeader() {
  const { t } = useTranslations("marketing");

  return (
    <div className="text-center mb-4">
      <h1 className="text-4xl font-bold tracking-tight">{t("featuresPageTitle")}</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
        {t("featuresPageSubtitle")}
      </p>
    </div>
  );
}

export function FeaturesPageCta() {
  const { t: tc } = useTranslations("common");

  return (
    <div className="text-center pb-20">
      <Button asChild size="lg">
        <Link href="/signup">{tc("getStarted")}</Link>
      </Button>
    </div>
  );
}
