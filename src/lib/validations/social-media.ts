import { z } from "zod";

export const socialMediaSchema = z.object({
  businessType: z.string().min(1, "Business type is required").max(100),
  productDescription: z.string().min(10, "Describe your product or service").max(1000),
  targetAudience: z.string().min(3, "Target audience is required").max(200),
  contentGoal: z.string().min(3, "Content goal is required").max(200),
  platform: z.enum(["instagram", "facebook", "tiktok", "linkedin", "x"]),
  tone: z.enum(["professional", "casual", "playful", "inspirational"]).optional(),
});

export type SocialMediaInput = z.infer<typeof socialMediaSchema>;

export const socialMediaOutputSchema = z.object({
  variations: z.array(
    z.object({
      caption: z.string(),
      hook: z.string().optional(),
    })
  ),
  hashtags: z.array(z.string()),
  ctas: z.array(z.string()),
});

export type SocialMediaOutput = z.infer<typeof socialMediaOutputSchema>;
