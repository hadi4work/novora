export const HILLTOPADS_SITE_VERIFICATION = {
  metaName: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  metaContent: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  fileName: "dc6c0320ccffdc85735e.txt",
} as const;

/** Paste HilltopAds Video zone JS snippet fields after creating the zone. */
export const HILLTOPADS_VIDEO = {
  scriptSrc: "",
  inlineScript: "",
  containerId: "hilltopads-video-reward",
} as const;

export function isHilltopAdsVideoConfigured() {
  return Boolean(HILLTOPADS_VIDEO.scriptSrc || HILLTOPADS_VIDEO.inlineScript);
}
