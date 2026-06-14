export const HILLTOPADS_SITE_VERIFICATION = {
  metaName: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  metaContent: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  fileName: "dc6c0320ccffdc85735e.txt",
} as const;

/** HilltopAds VAST tag — reward dialog (watch ad for +1 generation). */
export const HILLTOPADS_VIDEO = {
  vastTagUrl:
    "https://nautical-hand.com/d.m/FHzcdVG-NxvWZMGjUV/tebmU9fuoZBUXlUkaPwTFcFxMM/zoY/3HMzTFMItcNdzjEIzsNGj_c/xxN_wp",
  containerId: "hilltopads-video-reward",
} as const;

export function isHilltopAdsVideoConfigured() {
  return Boolean(HILLTOPADS_VIDEO.vastTagUrl);
}
