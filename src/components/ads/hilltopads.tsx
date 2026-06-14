"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  HILLTOPADS_VIDEO,
  isHilltopAdsVideoConfigured,
} from "@/lib/ads/hilltopads-config";
import {
  fireTrackingPixels,
  loadVastAd,
  type ParsedVastAd,
  type VastTrackingEvent,
} from "@/lib/ads/vast-player";
import { AD_WATCH_SECONDS } from "@/lib/constants";

type LoadState = "loading" | "ready" | "playing" | "paused" | "unavailable";

type HilltopAdsVideoAdProps = {
  className?: string;
  onWatchProgress?: (secondsWatched: number) => void;
  onWatchComplete?: () => void;
  onUnavailable?: () => void;
};

export function HilltopAdsVideoAd({
  className,
  onWatchProgress,
  onWatchComplete,
  onUnavailable,
}: HilltopAdsVideoAdProps) {
  const { t } = useTranslations("ads");
  const videoRef = useRef<HTMLVideoElement>(null);
  const firedEvents = useRef<Set<VastTrackingEvent>>(new Set());
  const playedSecondsRef = useRef(0);
  const watchCompleteRef = useRef(false);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ad, setAd] = useState<ParsedVastAd | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  const callbacksRef = useRef({
    onWatchProgress,
    onWatchComplete,
    onUnavailable,
  });

  useEffect(() => {
    callbacksRef.current = { onWatchProgress, onWatchComplete, onUnavailable };
  }, [onWatchProgress, onWatchComplete, onUnavailable]);

  const markUnavailable = useCallback(() => {
    setState("unavailable");
    callbacksRef.current.onUnavailable?.();
  }, []);

  const stopWatchTimer = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const startWatchTimer = useCallback(() => {
    stopWatchTimer();

    tickIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) return;

      playedSecondsRef.current = Math.min(
        AD_WATCH_SECONDS,
        playedSecondsRef.current + 0.2
      );

      callbacksRef.current.onWatchProgress?.(playedSecondsRef.current);

      if (
        playedSecondsRef.current >= AD_WATCH_SECONDS &&
        !watchCompleteRef.current
      ) {
        watchCompleteRef.current = true;
        stopWatchTimer();
        callbacksRef.current.onWatchComplete?.();
      }
    }, 200);
  }, [stopWatchTimer]);

  useEffect(() => {
    if (!isHilltopAdsVideoConfigured()) return;

    let cancelled = false;
    firedEvents.current.clear();
    playedSecondsRef.current = 0;
    watchCompleteRef.current = false;
    setAd(null);
    setState("loading");

    loadVastAd(HILLTOPADS_VIDEO.vastTagUrl)
      .then((parsed) => {
        if (cancelled) return;
        setAd(parsed);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        markUnavailable();
      });

    return () => {
      cancelled = true;
      stopWatchTimer();
    };
  }, [markUnavailable, stopWatchTimer]);

  useEffect(() => {
    if (state !== "ready" || !ad) return;

    fireTrackingPixels(ad.impressions);

    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      setState("paused");
    });
  }, [state, ad]);

  const trackOnce = (event: VastTrackingEvent) => {
    if (firedEvents.current.has(event)) return;
    firedEvents.current.add(event);
    fireTrackingPixels(ad?.tracking[event]);
  };

  if (!isHilltopAdsVideoConfigured()) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-lg border border-dashed bg-muted/50 ${className ?? ""}`}
      >
        <p className="px-4 text-center text-sm text-muted-foreground">
          {t("noVideoAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div
      id={HILLTOPADS_VIDEO.containerId}
      className={`relative aspect-video w-full overflow-hidden rounded-lg border bg-black ${className ?? ""}`}
    >
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {state === "unavailable" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 px-4 text-center">
          <p className="text-sm text-muted-foreground">{t("noVideoAvailable")}</p>
        </div>
      )}

      {ad && state !== "loading" && state !== "unavailable" && (
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          src={ad.mediaUrl}
          playsInline
          controls
          preload="auto"
          onPlay={() => {
            setState("playing");
            trackOnce("start");
            startWatchTimer();
          }}
          onPause={() => {
            setState("paused");
            stopWatchTimer();
          }}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            const duration = video.duration || ad.duration || 0;
            if (!duration) return;

            const progress = video.currentTime / duration;
            if (progress >= 0.25) trackOnce("firstQuartile");
            if (progress >= 0.5) trackOnce("midpoint");
            if (progress >= 0.75) trackOnce("thirdQuartile");
          }}
          onEnded={() => {
            trackOnce("complete");
            stopWatchTimer();
          }}
          onError={() => {
            markUnavailable();
          }}
        />
      )}
    </div>
  );
}
