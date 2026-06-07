"use client";

import { useTranslations } from "@/components/providers/locale-provider";

export function ToolPageHeader({
  namespace,
}: {
  namespace: "tools.socialMedia" | "tools.product" | "tools.resume";
}) {
  const { t } = useTranslations(namespace);

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground">{t("subtitle")}</p>
    </div>
  );
}
