"use client";

import Link from "next/link";
import { Share2, ShoppingBag, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsageMeter } from "@/components/dashboard/usage-meter";
import { useTranslations } from "@/components/providers/locale-provider";
import type { UsageInfo } from "@/types";

export function DashboardHome({
  firstName,
  usage,
  isFree,
}: {
  firstName?: string;
  usage: UsageInfo | null;
  isFree: boolean;
}) {
  const { t } = useTranslations("dashboard");
  const { t: tn } = useTranslations("nav");

  const tools = [
    {
      href: "/app/social-media",
      icon: Share2,
      title: tn("socialMedia"),
      description: t("socialDesc"),
    },
    {
      href: "/app/product-description",
      icon: ShoppingBag,
      title: tn("productDescriptions"),
      description: t("productDesc"),
    },
    {
      href: "/app/resume",
      icon: FileText,
      title: tn("resumeBuilder"),
      description: t("resumeDesc"),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {firstName ? `${t("welcome")}, ${firstName}` : t("welcome")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("quickStart")}</p>
      </div>

      {usage && (
        <div className="mb-8">
          <UsageMeter usage={usage} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.href} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <tool.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={tool.href}>
                  {t("quickStart")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {isFree && (
        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <p className="text-sm">{t("upgradeCta")}</p>
            <Button asChild size="sm">
              <Link href="/pricing">Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
