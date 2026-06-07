"use client";

import { PricingButton } from "@/components/marketing/pricing-button";
import { BillingActions } from "@/components/settings/billing-actions";
import { ProfileForm } from "@/components/settings/profile-form";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plan } from "@/types";

export function SettingsPageContent({
  profile,
}: {
  profile: {
    full_name: string | null;
    email: string;
    plan: Plan;
    plan_expires_at: string | null;
  } | null;
}) {
  const { locale } = useLocale();
  const { t } = useTranslations("settings");
  const { t: tc } = useTranslations("common");

  const dateLocale =
    locale === "ar" ? "ar" : locale === "fr" ? "fr" : locale === "ru" ? "ru" : locale === "de" ? "de" : "en";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile")}</CardTitle>
          <CardDescription>{t("profileDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {profile && (
            <ProfileForm fullName={profile.full_name} email={profile.email} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing")}</CardTitle>
          <CardDescription>{t("billingDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("currentPlan")}</span>
            <Badge className="capitalize">{tc(profile?.plan ?? "free")}</Badge>
          </div>
          {profile?.plan_expires_at && profile.plan !== "free" && (
            <p className="text-xs text-muted-foreground">
              {t("renewsExpires", {
                date: new Date(profile.plan_expires_at).toLocaleDateString(dateLocale),
              })}
            </p>
          )}
          {profile?.plan === "free" ? (
            <div className="flex gap-2">
              <PricingButton plan="pro" className="flex-1" />
              <PricingButton plan="business" className="flex-1" />
            </div>
          ) : (
            <BillingActions isPaidPlan planExpiresAt={profile?.plan_expires_at} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
