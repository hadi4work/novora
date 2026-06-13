"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ADSTERRA_KEYS,
  ADSTERRA_SIZES,
} from "@/lib/ads/adsterra-config";

function AdsterraBanner({
  adKey,
  width,
  height,
  className,
}: {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.text = `
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    invokeScript.async = true;

    container.appendChild(optionsScript);
    container.appendChild(invokeScript);

    return () => {
      container.innerHTML = "";
    };
  }, [adKey, width, height, instanceId]);

  return (
    <div
      className={`flex w-full justify-center overflow-hidden ${className ?? ""}`}
      style={{ minHeight: height }}
    >
      <div ref={containerRef} style={{ width, height, maxWidth: "100%" }} />
    </div>
  );
}

export function AdsterraLeaderboard({ className }: { className?: string }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  if (isMobile === null) {
    return (
      <div
        className={`flex w-full justify-center ${className ?? ""}`}
        style={{ minHeight: ADSTERRA_SIZES.mobileLeaderboard.height }}
      />
    );
  }

  if (isMobile) {
    const { width, height } = ADSTERRA_SIZES.mobileLeaderboard;
    return (
      <AdsterraBanner
        adKey={ADSTERRA_KEYS.mobileLeaderboard}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  const { width, height } = ADSTERRA_SIZES.leaderboard;
  return (
    <AdsterraBanner
      adKey={ADSTERRA_KEYS.leaderboard}
      width={width}
      height={height}
      className={className}
    />
  );
}

export function AdsterraRectangle({ className }: { className?: string }) {
  const { width, height } = ADSTERRA_SIZES.rectangle;
  return (
    <AdsterraBanner
      adKey={ADSTERRA_KEYS.rectangle}
      width={width}
      height={height}
      className={className}
    />
  );
}
