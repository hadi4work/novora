import type {
  Plan,
  ProductTone,
  SocialMediaTone,
  SocialPlatform,
  Tool,
  VideoAdPlatform,
  VideoAdTone,
} from "@/types";

export const APP_NAME = "Novora";
export const APP_TAGLINE = "Create. Grow. Succeed.";
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);
export const SUPPORT_EMAIL = process.env.CONTACT_EMAIL ?? "support@novora-ai.com";

export const FREE_DAILY_LIMIT = 3;
export const MAX_AD_REWARDS_PER_DAY = 3;
export const AD_WATCH_SECONDS = 10;

export const SOCIAL_MEDIA_TONES = [
  "professional",
  "casual",
  "playful",
  "inspirational",
] as const;

export const PRODUCT_TONES = ["professional", "friendly", "luxury", "playful"] as const;

export const VIDEO_AD_PLATFORMS: { value: VideoAdPlatform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram_reels", label: "Instagram Reels" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
];

export const VIDEO_AD_TONES = [
  "energetic",
  "professional",
  "emotional",
  "humorous",
  "luxury",
  "storytelling",
] as const;

export const VIDEO_AD_DURATIONS = [15, 30, 60, 90] as const;

export const PLAN_LIMITS: Record<
  Plan,
  {
    dailyGenerations: number | null;
    maxVariations: number;
    model: string;
    canExportPdf: boolean;
    canSaveHistory: boolean;
    showAds: boolean;
    allowedPlatforms: SocialPlatform[] | "all";
    socialMediaTones: SocialMediaTone[];
    productTones: ProductTone[];
    productDescriptionFormats: ("short" | "long" | "seo")[];
    videoAdTones: VideoAdTone[];
    videoAdDurations: number[];
    canImportProductUrl: boolean;
  }
> = {
  free: {
    dailyGenerations: FREE_DAILY_LIMIT,
    maxVariations: 2,
    model: "llama-3.1-8b-instant",
    canExportPdf: false,
    canSaveHistory: false,
    showAds: true,
    allowedPlatforms: "all",
    socialMediaTones: ["professional"],
    productTones: ["professional", "friendly"],
    productDescriptionFormats: ["short"],
    videoAdTones: ["energetic"],
    videoAdDurations: [15, 30],
    canImportProductUrl: false,
  },
  pro: {
    dailyGenerations: null,
    maxVariations: 5,
    model: "llama-3.3-70b-versatile",
    canExportPdf: true,
    canSaveHistory: true,
    showAds: false,
    allowedPlatforms: "all",
    socialMediaTones: [...SOCIAL_MEDIA_TONES],
    productTones: [...PRODUCT_TONES],
    productDescriptionFormats: ["short", "long", "seo"],
    videoAdTones: [...VIDEO_AD_TONES],
    videoAdDurations: [...VIDEO_AD_DURATIONS],
    canImportProductUrl: true,
  },
  business: {
    dailyGenerations: null,
    maxVariations: 8,
    model: "llama-3.3-70b-versatile",
    canExportPdf: true,
    canSaveHistory: true,
    showAds: false,
    allowedPlatforms: "all",
    socialMediaTones: [...SOCIAL_MEDIA_TONES],
    productTones: [...PRODUCT_TONES],
    productDescriptionFormats: ["short", "long", "seo"],
    videoAdTones: [...VIDEO_AD_TONES],
    videoAdDurations: [...VIDEO_AD_DURATIONS],
    canImportProductUrl: true,
  },
};

export const PLAN_PRICES = {
  pro: { monthly: 15, label: "Pro" },
  business: { monthly: 49, label: "Business" },
} as const;

export const TOOL_LABELS: Record<Tool, string> = {
  social_media: "Social Media Generator",
  product_description: "Product Description Generator",
  resume: "Resume Builder",
  video_ad_script: "Video Ad Script Generator",
};

export const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
];

export const BLOG_CATEGORIES = [
  "Resume Writing",
  "Social Media Marketing",
  "Content Creation",
  "E-commerce Marketing",
  "AI Productivity",
] as const;