export const HILLTOPADS_SITE_VERIFICATION = {
  metaName: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  metaContent: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  fileName: "dc6c0320ccffdc85735e.txt",
} as const;

/** HilltopAds Video zone — reward dialog (watch ad for +1 generation). */
export const HILLTOPADS_VIDEO = {
  scriptSrc:
    "https://quarrelsomebitter.com/bnX.Vvstd/GPld0xY/WbcH/_eZms9su-ZiULlXkTPWT/cqxDMazcUfxrNlzWMBt/NszDEAz/NHTYER3TNjwz",
  inlineScript: "",
  containerId: "hilltopads-video-reward",
};

export function isHilltopAdsVideoConfigured() {
  return Boolean(HILLTOPADS_VIDEO.scriptSrc || HILLTOPADS_VIDEO.inlineScript);
}
