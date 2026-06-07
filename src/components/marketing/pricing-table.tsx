"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_PRICES } from "@/lib/constants";
import { PricingButton } from "@/components/marketing/pricing-button";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";

const planMeta = [
  { key: "free" as const, price: 0, plan: null as "pro" | "business" | null, highlighted: false },
  { key: "pro" as const, price: PLAN_PRICES.pro.monthly, plan: "pro" as const, highlighted: true },
  { key: "business" as const, price: PLAN_PRICES.business.monthly, plan: "business" as const, highlighted: false },
];

export function PricingTable() {
  const { messages } = useLocale();
  const { t } = useTranslations("pricing");

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {planMeta.map((meta) => {
        const planData = messages.pricing.plans[meta.key];

        return (
          <div
            key={meta.key}
            className={meta.highlighted ? "relative pt-5 md:col-span-1" : "relative"}
          >
            {meta.highlighted && (
              <Badge className="absolute top-0 left-1/2 z-10 -translate-x-1/2 shadow-sm">
                {t("mostPopular")}
              </Badge>
            )}
            <Card
              className={
                meta.highlighted ? "h-full border-primary shadow-lg" : "h-full"
              }
            >
              <CardHeader>
                <CardTitle>{planData.name}</CardTitle>
                <CardDescription>{planData.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${meta.price}</span>
                  {meta.price > 0 && (
                    <span className="text-muted-foreground">{t("perMonth")}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {planData.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {meta.plan ? (
                  <PricingButton plan={meta.plan} className="w-full" />
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/signup">{t("getStartedFree")}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
