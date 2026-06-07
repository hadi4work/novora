"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { QuotaRewardDialog } from "@/components/ads/quota-reward-dialog";
import { useTranslations } from "@/components/providers/locale-provider";
import type { UsageInfo } from "@/types";

export function UsageMeter({ usage }: { usage: UsageInfo }) {
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const { t } = useTranslations("dashboard");
  const { t: tc } = useTranslations("common");

  if (usage.isUnlimited) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("usageTitle")}</span>
          <span className="text-sm text-primary font-medium">{t("unlimited")}</span>
        </div>
      </div>
    );
  }

  const effectiveLimit = (usage.limit ?? 0) + (usage.adBonus ?? 0);
  const percent = effectiveLimit
    ? Math.round((usage.used / effectiveLimit) * 100)
    : 0;

  return (
    <>
      <QuotaRewardDialog
        open={quotaDialogOpen}
        onOpenChange={setQuotaDialogOpen}
        adRewardsRemaining={usage.adRewardsRemaining ?? 0}
      />
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t("usageTitle")}</span>
          <span className="text-sm text-muted-foreground">
            {usage.used} / {effectiveLimit}
            {(usage.adBonus ?? 0) > 0 && (
              <span className="text-primary ms-1">
                {t("fromAds", { count: usage.adBonus ?? 0 })}
              </span>
            )}
          </span>
        </div>
        <Progress value={percent} className="h-2" />
        {usage.remaining === 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-destructive">{t("limitReached")}</p>
            {(usage.adRewardsRemaining ?? 0) > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setQuotaDialogOpen(true)}
              >
                <Play className="h-3.5 w-3.5" />
                {t("watchAd")}
              </Button>
            ) : null}
            <p className="text-xs text-muted-foreground">
              <a href="/pricing" className="underline">
                {tc("upgrade")} Pro
              </a>{" "}
              — {tc("upgradeForUnlimited")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
