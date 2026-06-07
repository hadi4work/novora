"use client";

import { PricingTable } from "@/components/marketing/pricing-table";
import { useTranslations } from "@/components/providers/locale-provider";

export function HomePricingSection() {
  const { t } = useTranslations("pricing");

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">{t("homeTitle")}</h2>
          <p className="mt-4 text-muted-foreground">{t("homeSubtitle")}</p>
        </div>
        <PricingTable />
      </div>
    </section>
  );
}
