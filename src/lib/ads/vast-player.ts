export type VastTrackingEvent =
  | "start"
  | "firstQuartile"
  | "midpoint"
  | "thirdQuartile"
  | "complete";

export type ParsedVastAd = {
  mediaUrl: string;
  duration: number;
  impressions: string[];
  tracking: Partial<Record<VastTrackingEvent, string[]>>;
};

function getTextContent(node: Element | null) {
  if (!node) return "";
  const cdata = node.textContent?.trim() ?? "";
  return cdata;
}

function parseDuration(value: string | null | undefined) {
  if (!value) return 0;
  const parts = value.split(":").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function pickMediaUrl(doc: Document) {
  const files = Array.from(doc.querySelectorAll("MediaFile"))
    .map((node) => getTextContent(node))
    .filter(Boolean);

  const mp4 = files.find((url) => url.includes(".mp4"));
  if (mp4) return mp4;

  const webm = files.find((url) => url.includes(".webm"));
  if (webm) return webm;

  return files[0] ?? "";
}

export function parseVastXml(xml: string): ParsedVastAd | null {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return null;

  const mediaUrl = pickMediaUrl(doc);
  if (!mediaUrl) return null;

  const duration = parseDuration(getTextContent(doc.querySelector("Duration")));

  const impressions = Array.from(doc.querySelectorAll("Impression"))
    .map((node) => getTextContent(node))
    .filter(Boolean);

  const tracking: ParsedVastAd["tracking"] = {};
  for (const node of Array.from(doc.querySelectorAll("Tracking"))) {
    const event = node.getAttribute("event") as VastTrackingEvent | null;
    const url = getTextContent(node);
    if (!event || !url) continue;
    tracking[event] = [...(tracking[event] ?? []), url];
  }

  return { mediaUrl, duration, impressions, tracking };
}

export async function loadVastAd(tagUrl: string): Promise<ParsedVastAd> {
  const response = await fetch(tagUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("no_video");
  }

  const xml = await response.text();
  if (!xml.trim() || !xml.includes("<MediaFile")) {
    throw new Error("no_video");
  }

  const parsed = parseVastXml(xml);
  if (!parsed) {
    throw new Error("no_video");
  }

  return parsed;
}

export function fireTrackingPixels(urls: string[] | undefined) {
  if (!urls?.length) return;

  for (const url of urls) {
    const img = new Image();
    img.src = url;
  }
}
