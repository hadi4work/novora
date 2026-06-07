"use client";

import { PricingTable } from "@/components/marketing/pricing-table";
import { FAQ } from "@/components/marketing/faq";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";

export function PricingPageContent() {
  const { messages } = useLocale();
  const { t } = useTranslations("pricing");

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("manualRenewal")}</p>
      </div>
      <PricingTable />
      <section className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("faq")}</h2>
        <FAQ items={messages.pricing.faqs} />
      </section>
    </>
  );
}
