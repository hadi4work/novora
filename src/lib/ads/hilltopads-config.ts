export const HILLTOPADS_SITE_VERIFICATION = {
  metaName: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  metaContent: "dc6c0320ccffdc85735e85611db9391db569e0f9",
  fileName: "dc6c0320ccffdc85735e.txt",
} as const;

/** HilltopAds Video zone — reward dialog (watch ad for +1 generation). */
export const HILLTOPADS_VIDEO = {
  scriptSrc: "",
  inlineScript: `(function(tjen){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = tjen || {};
s.src = "\\/\\/quarrelsomebitter.com\\/bnX.Vvstd\\/GPld0xY\\/WbcH\\/_eZms9su-ZiULlXkTPWT\\/cqxDMazcUfxrNlzWMBt\\/NszDEAz\\/NHTYER3TNjwz";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})`,
  containerId: "hilltopads-video-reward",
};

export function isHilltopAdsVideoConfigured() {
  return Boolean(HILLTOPADS_VIDEO.scriptSrc || HILLTOPADS_VIDEO.inlineScript);
}
