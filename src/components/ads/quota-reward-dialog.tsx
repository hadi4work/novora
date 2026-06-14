"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { claimAdReward } from "@/actions/ad-reward";
import { HilltopAdsVideoAd } from "@/components/ads/hilltopads";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { AD_WATCH_SECONDS } from "@/lib/constants";

type Step = "prompt" | "watching" | "claiming" | "no_video";

function mapClaimError(
  error: string | undefined,
  t: (key: string) => string
) {
  switch (error) {
    case "daily_ad_limit_reached":
      return t("dailyAdLimit");
    case "too_soon":
      return t("watchNotComplete");
    case "rpc_failed":
    case "claim_failed":
    default:
      return t("claimFailed");
  }
}

export function QuotaRewardDialog({
  open,
  onOpenChange,
  adRewardsRemaining = 0,
  onRewardGranted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adRewardsRemaining?: number;
  onRewardGranted?: () => void;
}) {
  const { t } = useTranslations("ads");
  const { t: tc } = useTranslations("common");
  const [step, setStep] = useState<Step>("prompt");
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [watchAttempt, setWatchAttempt] = useState(0);
  const [isPending, startTransition] = useTransition();
  const claimingRef = useRef(false);
  const onRewardGrantedRef = useRef(onRewardGranted);
  const onOpenChangeRef = useRef(onOpenChange);
  const tRef = useRef(t);

  useEffect(() => {
    onRewardGrantedRef.current = onRewardGranted;
    onOpenChangeRef.current = onOpenChange;
    tRef.current = t;
  }, [onRewardGranted, onOpenChange, t]);

  const reset = useCallback(() => {
    setStep("prompt");
    setSecondsWatched(0);
    claimingRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleWatchComplete = useCallback(() => {
    if (claimingRef.current) return;
    claimingRef.current = true;
    setStep("claiming");

    startTransition(async () => {
      const result = await claimAdReward();
      if (!result.success) {
        toast.error(mapClaimError(result.error, tRef.current));
        claimingRef.current = false;
        setStep("prompt");
        return;
      }

      toast.success(tRef.current("rewardGranted"), {
        description: tRef.current("rewardGrantedDesc"),
      });
      onOpenChangeRef.current(false);
      onRewardGrantedRef.current?.();
    });
  }, [startTransition]);

  const watchProgress = Math.min(
    100,
    (secondsWatched / AD_WATCH_SECONDS) * 100
  );
  const secondsLeft = Math.max(
    0,
    Math.ceil(AD_WATCH_SECONDS - secondsWatched)
  );
  const timerStarted = secondsWatched > 0.3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {step === "prompt" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("limitReached")}</DialogTitle>
              <DialogDescription>{t("limitDesc")}</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              {adRewardsRemaining > 0 ? (
                <p>{t("rewardsLeft", { count: adRewardsRemaining })}</p>
              ) : (
                <p>{t("noRewards")}</p>
              )}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              {adRewardsRemaining > 0 ? (
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    setSecondsWatched(0);
                    claimingRef.current = false;
                    setWatchAttempt((n) => n + 1);
                    setStep("watching");
                  }}
                >
                  <Play className="h-4 w-4" />
                  {t("watchAd")}
                </Button>
              ) : null}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/pricing">{tc("upgrade")} Pro</Link>
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "watching" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("watchTitle")}</DialogTitle>
              <DialogDescription>{t("watchDesc")}</DialogDescription>
            </DialogHeader>
            <HilltopAdsVideoAd
              key={watchAttempt}
              onWatchProgress={setSecondsWatched}
              onWatchComplete={handleWatchComplete}
              onUnavailable={() => setStep("no_video")}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("timeRemaining")}</span>
                <span className="font-medium">
                  {timerStarted ? `${secondsLeft}s` : t("waitingForVideo")}
                </span>
              </div>
              <Progress value={watchProgress} className="h-2" />
            </div>
          </>
        )}

        {step === "no_video" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("watchTitle")}</DialogTitle>
              <DialogDescription>{t("noVideoAvailable")}</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              {t("noVideoAvailable")}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                className="w-full"
                onClick={() => {
                  setSecondsWatched(0);
                  claimingRef.current = false;
                  setWatchAttempt((n) => n + 1);
                  setStep("watching");
                }}
              >
                {t("tryAgainLater")}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep("prompt")}>
                {tc("cancel")}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "claiming" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t("unlocking")}</p>
          </div>
        )}

        {isPending && step !== "claiming" && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
