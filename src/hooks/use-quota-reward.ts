"use client";

import { useState } from "react";

type QuotaError = {
  success: false;
  error: string;
  code?: string;
  canWatchAd?: boolean;
  adRewardsRemaining?: number;
};

export function useQuotaReward() {
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const [adRewardsRemaining, setAdRewardsRemaining] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  function handleQuotaError(result: QuotaError): boolean {
    if (result.code !== "quota_exceeded") return false;

    if (result.canWatchAd) {
      setAdRewardsRemaining(result.adRewardsRemaining ?? 0);
      setQuotaDialogOpen(true);
      return true;
    }

    return false;
  }

  function onRewardGranted() {
    setRetryToken((n) => n + 1);
  }

  return {
    quotaDialogOpen,
    setQuotaDialogOpen,
    adRewardsRemaining,
    retryToken,
    handleQuotaError,
    onRewardGranted,
  };
}
