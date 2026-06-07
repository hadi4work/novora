"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/actions/subscription";
import { useTranslations } from "@/components/providers/locale-provider";

export function PricingButton({
  plan,
  className,
}: {
  plan: "pro" | "business";
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslations("pricing");
  const { t: tc } = useTranslations("common");

  return (
    <Button
      className={className}
      disabled={isPending}
      onClick={() => startTransition(() => startCheckout(plan))}
    >
      {isPending
        ? tc("loading")
        : plan === "pro"
          ? t("upgradePro")
          : t("upgradeBusiness")}
    </Button>
  );
}
