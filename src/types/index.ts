export type Plan = "free" | "pro" | "business";
export type Tool = "social_media" | "product_description" | "resume" | "video_ad_script";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "paused";
export type GenerationStatus = "completed" | "failed" | "rate_limited";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type BlogStatus = "draft" | "published" | "archived";
export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "linkedin"
  | "x";
export type SocialMediaTone =
  | "professional"
  | "casual"
  | "playful"
  | "inspirational";
export type ProductTone = "professional" | "friendly" | "luxury" | "playful";
export type VideoAdPlatform =
  | "tiktok"
  | "instagram_reels"
  | "youtube_shorts"
  | "facebook"
  | "youtube";
export type VideoAdTone =
  | "energetic"
  | "professional"
  | "emotional"
  | "humorous"
  | "luxury"
  | "storytelling";
export type ResumeTemplate =
  | "executive"
  | "modern"
  | "creative"
  | "corporate"
  | "classic"
  | "ats"
  | "professional";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  role: "user" | "admin";
  plan_expires_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  tool: Tool;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  model: string;
  tokens_used: number | null;
  latency_ms: number | null;
  status: GenerationStatus;
  created_at: string;
}

export interface SavedResult {
  id: string;
  user_id: string;
  generation_id: string | null;
  tool: Tool;
  title: string;
  content: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  author_id: string | null;
  status: BlogStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageInfo {
  used: number;
  limit: number | null;
  remaining: number | null;
  isUnlimited: boolean;
  adBonus?: number;
  adRewardsRemaining?: number;
}

export interface Entitlements {
  plan: Plan;
  dailyGenerationLimit: number | null;
  maxVariations: number;
  canExportPdf: boolean;
  canSaveHistory: boolean;
  showAds: boolean;
  model: string;
  allowedPlatforms: SocialPlatform[] | "all";
  socialMediaTones: SocialMediaTone[];
  productTones: ProductTone[];
  productDescriptionFormats: ("short" | "long" | "seo")[];
  videoAdTones: VideoAdTone[];
  videoAdDurations: number[];
  canImportProductUrl: boolean;
}
