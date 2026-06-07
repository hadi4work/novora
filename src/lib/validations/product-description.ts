import { z } from "zod";

export const productDescriptionSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(200),
  features: z.string().min(10, "List at least one feature").max(2000),
  targetAudience: z.string().min(3, "Target audience is required").max(200),
  tone: z.enum(["professional", "friendly", "luxury", "playful"]).optional(),
  formats: z.array(z.enum(["short", "long", "seo"])).min(1),
});

export type ProductDescriptionInput = z.infer<typeof productDescriptionSchema>;

export const productDescriptionOutputSchema = z.object({
  short: z.string().optional(),
  long: z.string().optional(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
  }).optional(),
});

export type ProductDescriptionOutput = z.infer<typeof productDescriptionOutputSchema>;
