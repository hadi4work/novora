"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
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

type Step = "prompt" | "watching" | "claiming";

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
  const [watchProgress, setWatchProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(AD_WATCH_SECONDS);
  const [isPending, startTransition] = useTransition();
  const watchStarted = useRef(false);

  const reset = useCallback(() => {
    setStep("prompt");
    setWatchProgress(0);
    setSecondsLeft(AD_WATCH_SECONDS);
    watchStarted.current = false;
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (step !== "watching" || watchStarted.current) return;
    watchStarted.current = true;

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const progress = Math.min(100, (elapsed / AD_WATCH_SECONDS) * 100);
      const remaining = Math.max(0, Math.ceil(AD_WATCH_SECONDS - elapsed));

      setWatchProgress(progress);
      setSecondsLeft(remaining);

      if (elapsed >= AD_WATCH_SECONDS) {
        clearInterval(interval);
        setStep("claiming");
        startTransition(async () => {
          const result = await claimAdReward();
          if (!result.success) {
            toast.error(result.error ?? "Error");
            setStep("prompt");
            watchStarted.current = false;
            return;
          }

          toast.success(t("rewardGranted"), { description: t("rewardGrantedDesc") });
          onOpenChange(false);
          onRewardGranted?.();
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [step, onOpenChange, onRewardGranted, t]);

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
                <Button className="w-full gap-2" onClick={() => setStep("watching")}>
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
            <HilltopAdsVideoAd />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("timeRemaining")}</span>
                <span className="font-medium">{secondsLeft}s</span>
              </div>
              <Progress value={watchProgress} className="h-2" />
            </div>
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
            <Sparkles className="h-4 w-4" />
            ...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
