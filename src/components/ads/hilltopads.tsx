"use client";

import { useEffect, useRef } from "react";
import {
  HILLTOPADS_VIDEO,
  isHilltopAdsVideoConfigured,
} from "@/lib/ads/hilltopads-config";

export function HilltopAdsVideoAd({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isHilltopAdsVideoConfigured() || loadedRef.current) return;

    const target = containerRef.current;
    if (!target) return;

    loadedRef.current = true;
    target.innerHTML = "";

    if (HILLTOPADS_VIDEO.scriptSrc) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.referrerPolicy = "no-referrer-when-downgrade";
      script.src = HILLTOPADS_VIDEO.scriptSrc;
      target.appendChild(script);
    } else if (HILLTOPADS_VIDEO.inlineScript) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.text = HILLTOPADS_VIDEO.inlineScript;
      target.appendChild(script);
    }

    return () => {
      target.innerHTML = "";
      loadedRef.current = false;
    };
  }, []);

  if (!isHilltopAdsVideoConfigured()) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-lg border border-dashed bg-muted/50 ${className ?? ""}`}
      >
        <div className="px-4 text-center">
          <p className="text-sm font-medium">Video ad placement</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your HilltopAds Video zone code in hilltopads-config.ts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id={HILLTOPADS_VIDEO.containerId}
      ref={containerRef}
      className={`aspect-video w-full overflow-hidden rounded-lg border bg-muted/30 ${className ?? ""}`}
    />
  );
}
