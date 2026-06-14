import { z } from "zod";

export const videoAdScriptSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(200),
  productFeatures: z.string().min(10, "Describe the product features").max(3000),
  targetAudience: z.string().min(3, "Target audience is required").max(200),
  platform: z.enum([
    "tiktok",
    "instagram_reels",
    "youtube_shorts",
    "facebook",
    "youtube",
  ]),
  tone: z
    .enum(["energetic", "professional", "emotional", "humorous", "luxury", "storytelling"])
    .optional(),
  durationSeconds: z.union([
    z.literal(15),
    z.literal(30),
    z.literal(60),
    z.literal(90),
  ]),
  sourceUrl: z.string().url().optional(),
});

export type VideoAdScriptInput = z.infer<typeof videoAdScriptSchema>;

export const videoAdScriptLineSchema = z.object({
  startSeconds: z.number(),
  endSeconds: z.number(),
  text: z.string(),
  visualSuggestion: z.string().optional(),
});

export const videoAdScriptOutputSchema = z.object({
  suggestedDurationSeconds: z.number(),
  hook: z.string(),
  script: z.array(videoAdScriptLineSchema).min(1),
  cta: z.string(),
  bRollSuggestions: z.array(z.string()),
  musicMood: z.string().optional(),
  alternativeHooks: z.array(z.string()).optional(),
});

export type VideoAdScriptOutput = z.infer<typeof videoAdScriptOutputSchema>;

export const fetchedProductSchema = z.object({
  productName: z.string(),
  productFeatures: z.string(),
  imageUrl: z.string().optional(),
  sourceUrl: z.string(),
});

export type FetchedProduct = z.infer<typeof fetchedProductSchema>;
