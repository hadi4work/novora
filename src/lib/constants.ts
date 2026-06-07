import type { Plan, SocialPlatform, Tool } from "@/types";

export const APP_NAME = "Novora";
export const APP_TAGLINE = "Create. Grow. Succeed.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const FREE_DAILY_LIMIT = 3;
export const MAX_AD_REWARDS_PER_DAY = 3;
export const AD_WATCH_SECONDS = 15;

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
    productDescriptionFormats: ("short" | "long" | "seo")[];
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
    productDescriptionFormats: ["short"],
  },
  pro: {
    dailyGenerations: null,
    maxVariations: 5,
    model: "llama-3.3-70b-versatile",
    canExportPdf: true,
    canSaveHistory: true,
    showAds: false,
    allowedPlatforms: "all",
    productDescriptionFormats: ["short", "long", "seo"],
  },
  business: {
    dailyGenerations: null,
    maxVariations: 8,
    model: "llama-3.3-70b-versatile",
    canExportPdf: true,
    canSaveHistory: true,
    showAds: false,
    allowedPlatforms: "all",
    productDescriptionFormats: ["short", "long", "seo"],
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
