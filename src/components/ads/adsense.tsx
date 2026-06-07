"use client";

import Script from "next/script";

const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const rewardedSlot = process.env.NEXT_PUBLIC_ADSENSE_REWARDED_SLOT;

export function AdSenseScript() {
  if (!clientId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export function AdUnit({
  slot,
  format = "auto",
  className,
}: {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}) {
  if (!clientId) return null;

  return (
    <div className={className} style={{ minHeight: format === "horizontal" ? 90 : 250 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <Script id={`adsense-${slot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}

export function RewardedVideoAd({ className }: { className?: string }) {
  if (!clientId) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-lg border border-dashed bg-muted/50 ${className ?? ""}`}
      >
        <div className="text-center px-4">
          <p className="text-sm font-medium">Video ad placement</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to show Google video ads
          </p>
        </div>
      </div>
    );
  }

  const slot = rewardedSlot ?? "rewarded-video";

  return (
    <div
      className={`aspect-video w-full overflow-hidden rounded-lg border bg-muted/30 ${className ?? ""}`}
    >
      <ins
        className="adsbygoogle block h-full w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="autorelaxed"
        data-full-width-responsive="true"
      />
      <Script id="adsense-rewarded-video" strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
