"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
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

type LoadState = "loading" | "ready" | "playing" | "error";

export function HilltopAdsVideoAd({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const firedEvents = useRef<Set<VastTrackingEvent>>(new Set());
  const [ad, setAd] = useState<ParsedVastAd | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isHilltopAdsVideoConfigured()) return;

    let cancelled = false;
    firedEvents.current.clear();
    setAd(null);
    setState("loading");
    setErrorMessage(null);

    loadVastAd(HILLTOPADS_VIDEO.vastTagUrl)
      .then((parsed) => {
        if (cancelled) return;
        setAd(parsed);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load video ad"
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state !== "ready" || !ad) return;

    fireTrackingPixels(ad.impressions);

    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      setState("error");
      setErrorMessage("Tap play to start the video ad");
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
        <div className="px-4 text-center">
          <p className="text-sm font-medium">Video ad placement</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your HilltopAds VAST tag in hilltopads-config.ts
          </p>
        </div>
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

      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {errorMessage ?? "Video ad unavailable right now"}
          </p>
        </div>
      )}

      {ad && state !== "loading" && state !== "error" && (
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
          onEnded={() => trackOnce("complete")}
          onError={() => {
            setState("error");
            setErrorMessage("Video ad could not be played");
          }}
        />
      )}
    </div>
  );
}
