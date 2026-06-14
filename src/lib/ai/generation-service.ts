import { AIClientError, generateWithAI, parseJsonFromResponse } from "@/lib/ai/ai-client";
import { buildProductDescriptionPrompt } from "@/lib/ai/prompts/product-description/system";
import { buildResumePrompt } from "@/lib/ai/prompts/resume/system";
import { buildSocialMediaPrompt } from "@/lib/ai/prompts/social-media/system";
import { buildVideoAdScriptPrompt } from "@/lib/ai/prompts/video-ad-script/system";
import { getEntitlements } from "@/lib/auth/entitlements";
import { createClient } from "@/lib/auth/supabase-server";
import { logAuditEvent } from "@/lib/audit/audit-service";
import { getServerTranslations } from "@/lib/i18n/server";
import { getAdRewardStatus } from "@/lib/quota/ad-reward-service";
import {
  checkAndIncrementUsage,
  decrementUsage,
} from "@/lib/quota/usage-service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  productDescriptionOutputSchema,
  productDescriptionSchema,
  type ProductDescriptionOutput,
} from "@/lib/validations/product-description";
import { mergeResumeOutput } from "@/lib/resume/merge-output";
import {
  resumeOutputSchema,
  resumeSchema,
  type ResumeOutput,
} from "@/lib/validations/resume";
import {
  socialMediaOutputSchema,
  socialMediaSchema,
  type SocialMediaOutput,
} from "@/lib/validations/social-media";
import {
  videoAdScriptOutputSchema,
  videoAdScriptSchema,
  type VideoAdScriptOutput,
} from "@/lib/validations/video-ad-script";
import type { Entitlements, Profile, Tool } from "@/types";

export type GenerationResult<T> = {
  success: true;
  data: T;
  generationId: string;
  remaining: number | null;
} | {
  success: false;
  error: string;
  code?: "quota_exceeded" | "rate_limited" | "unauthorized" | "validation_error";
  canWatchAd?: boolean;
  adRewardsRemaining?: number;
};

async function requireAuth(): Promise<{ userId: string; profile: Profile } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return { userId: user.id, profile: profile as Profile };
}

async function saveGeneration(params: {
  userId: string;
  tool: Tool;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  model: string;
  tokensUsed: number | null;
  latencyMs: number;
  status: "completed" | "failed";
}): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generations")
    .insert({
      user_id: params.userId,
      tool: params.tool,
      input_data: params.input,
      output_data: params.output,
      model: params.model,
      tokens_used: params.tokensUsed,
      latency_ms: params.latencyMs,
      status: params.status,
    })
    .select("id")
    .single();

  return data?.id ?? "";
}

async function runGeneration<T>(params: {
  userId: string;
  tool: Tool;
  entitlements: Entitlements;
  input: Record<string, unknown>;
  auditMetadata?: Record<string, unknown>;
  generate: () => ReturnType<typeof generateWithAI>;
  parse: (content: string) => T;
  validate: (output: T) => { success: boolean; data?: T };
}): Promise<GenerationResult<T>> {
  const { t } = await getServerTranslations();

  const rateCheck = await checkRateLimit(`user:${params.userId}`);
  if (!rateCheck.success) {
    return {
      success: false,
      error: t("errors.rateLimited"),
      code: "rate_limited",
    };
  }

  const usage = await checkAndIncrementUsage(
    params.userId,
    params.tool,
    params.entitlements.dailyGenerationLimit
  );

  if (!usage.allowed) {
    const adReward =
      params.entitlements.dailyGenerationLimit !== null
        ? await getAdRewardStatus(params.userId)
        : null;

    return {
      success: false,
      error: adReward?.canWatchAd
        ? t("errors.quotaWatchAd")
        : t("errors.quotaExceeded"),
      code: "quota_exceeded",
      canWatchAd: adReward?.canWatchAd ?? false,
      adRewardsRemaining: adReward?.grantsRemaining ?? 0,
    };
  }

  try {
    const aiResult = await params.generate();

    let parsed: T;
    try {
      parsed = params.parse(aiResult.content);
    } catch {
      await decrementUsage(params.userId, params.tool);
      return {
        success: false,
        error: t("errors.parseFailed"),
      };
    }

    const validated = params.validate(parsed);
    if (!validated.success || !validated.data) {
      await decrementUsage(params.userId, params.tool);
      return {
        success: false,
        error: t("errors.parseFailed"),
      };
    }

    const generationId = await saveGeneration({
      userId: params.userId,
      tool: params.tool,
      input: params.input,
      output: validated.data as Record<string, unknown>,
      model: aiResult.model,
      tokensUsed: aiResult.tokensUsed,
      latencyMs: aiResult.latencyMs,
      status: "completed",
    });

    await logAuditEvent({
      action: "generation",
      resourceType: params.tool,
      resourceId: generationId,
      metadata: params.auditMetadata,
    });

    const bonus = (usage as { bonus?: number }).bonus ?? 0;

    return {
      success: true,
      data: validated.data,
      generationId,
      remaining: usage.limit ? usage.limit + bonus - usage.used : null,
    };
  } catch (error) {
    await decrementUsage(params.userId, params.tool);

    const message =
      error instanceof AIClientError ? error.message : t("errors.generationFailed");

    return { success: false, error: message };
  }
}

export async function generateSocialMedia(
  rawInput: unknown
): Promise<GenerationResult<SocialMediaOutput>> {
  const auth = await requireAuth();
  if (!auth) {
    return {
      success: false,
      error: "Please sign in to generate content.",
      code: "unauthorized",
    };
  }

  const parsed = socialMediaSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: "validation_error",
    };
  }

  const entitlements = getEntitlements(auth.profile);
  const allowed =
    entitlements.allowedPlatforms === "all" ||
    entitlements.allowedPlatforms.includes(parsed.data.platform);

  if (!allowed) {
    return {
      success: false,
      error: "Upgrade to Pro to generate content for all platforms.",
      code: "quota_exceeded",
    };
  }

  const requestedTone = parsed.data.tone ?? "professional";
  if (!entitlements.socialMediaTones.includes(requestedTone)) {
    return {
      success: false,
      error: "Upgrade to Pro to use all tone options.",
      code: "quota_exceeded",
    };
  }

  const prompt = buildSocialMediaPrompt(parsed.data, entitlements.maxVariations);

  return runGeneration({
    userId: auth.userId,
    tool: "social_media",
    entitlements,
    input: parsed.data,
    auditMetadata: { platform: parsed.data.platform },
    generate: () =>
      generateWithAI({
        system: prompt.system,
        user: prompt.user,
        model: entitlements.model,
        tool: "social_media",
      }),
    parse: (content) => parseJsonFromResponse<SocialMediaOutput>(content),
    validate: (output) => {
      const result = socialMediaOutputSchema.safeParse(output);
      return result.success
        ? { success: true, data: result.data }
        : { success: false };
    },
  });
}

export async function generateProductDescription(
  rawInput: unknown
): Promise<GenerationResult<ProductDescriptionOutput>> {
  const auth = await requireAuth();
  if (!auth) {
    return {
      success: false,
      error: "Please sign in to generate content.",
      code: "unauthorized",
    };
  }

  const parsed = productDescriptionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: "validation_error",
    };
  }

  const entitlements = getEntitlements(auth.profile);
  const invalidFormats = parsed.data.formats.filter(
    (f) => !entitlements.productDescriptionFormats.includes(f)
  );

  if (invalidFormats.length > 0) {
    return {
      success: false,
      error: "Upgrade to Pro for long and SEO descriptions.",
      code: "quota_exceeded",
    };
  }

  const requestedTone = parsed.data.tone ?? "professional";
  if (!entitlements.productTones.includes(requestedTone)) {
    return {
      success: false,
      error: "Upgrade to Pro to use all tone options.",
      code: "quota_exceeded",
    };
  }

  const prompt = buildProductDescriptionPrompt(parsed.data);

  return runGeneration({
    userId: auth.userId,
    tool: "product_description",
    entitlements,
    input: parsed.data,
    generate: () =>
      generateWithAI({
        system: prompt.system,
        user: prompt.user,
        model: entitlements.model,
        tool: "product_description",
      }),
    parse: (content) => parseJsonFromResponse<ProductDescriptionOutput>(content),
    validate: (output) => {
      const result = productDescriptionOutputSchema.safeParse(output);
      return result.success
        ? { success: true, data: result.data }
        : { success: false };
    },
  });
}

export async function generateVideoAdScript(
  rawInput: unknown
): Promise<GenerationResult<VideoAdScriptOutput>> {
  const auth = await requireAuth();
  if (!auth) {
    return {
      success: false,
      error: "Please sign in to generate content.",
      code: "unauthorized",
    };
  }

  const parsed = videoAdScriptSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: "validation_error",
    };
  }

  const entitlements = getEntitlements(auth.profile);
  const requestedTone = parsed.data.tone ?? "energetic";

  if (!entitlements.videoAdTones.includes(requestedTone)) {
    return {
      success: false,
      error: "Upgrade to Pro to use all tone options.",
      code: "quota_exceeded",
    };
  }

  if (!entitlements.videoAdDurations.includes(parsed.data.durationSeconds)) {
    return {
      success: false,
      error: "Upgrade to Pro for 60s and 90s video scripts.",
      code: "quota_exceeded",
    };
  }

  if (parsed.data.sourceUrl && !entitlements.canImportProductUrl) {
    return {
      success: false,
      error: "Upgrade to Pro to generate scripts from product URLs.",
      code: "quota_exceeded",
    };
  }

  const alternativeHooks =
    entitlements.plan === "free" ? 0 : Math.min(2, entitlements.maxVariations - 1);

  const prompt = buildVideoAdScriptPrompt(parsed.data, alternativeHooks);

  return runGeneration({
    userId: auth.userId,
    tool: "video_ad_script",
    entitlements,
    input: parsed.data,
    auditMetadata: { platform: parsed.data.platform },
    generate: () =>
      generateWithAI({
        system: prompt.system,
        user: prompt.user,
        model: entitlements.model,
        tool: "video_ad_script",
      }),
    parse: (content) => parseJsonFromResponse<VideoAdScriptOutput>(content),
    validate: (output) => {
      const result = videoAdScriptOutputSchema.safeParse(output);
      return result.success
        ? { success: true, data: result.data }
        : { success: false };
    },
  });
}

export async function generateResume(
  rawInput: unknown
): Promise<GenerationResult<ResumeOutput>> {
  const auth = await requireAuth();
  if (!auth) {
    return {
      success: false,
      error: "Please sign in to generate content.",
      code: "unauthorized",
    };
  }

  const parsed = resumeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: "validation_error",
    };
  }

  const entitlements = getEntitlements(auth.profile);
  const prompt = buildResumePrompt(parsed.data);

  return runGeneration({
    userId: auth.userId,
    tool: "resume",
    entitlements,
    input: parsed.data,
    auditMetadata: { template: parsed.data.template },
    generate: () =>
      generateWithAI({
        system: prompt.system,
        user: prompt.user,
        model: entitlements.model,
        tool: "resume",
      }),
    parse: (content) => parseJsonFromResponse<ResumeOutput>(content),
    validate: (output) => {
      const result = resumeOutputSchema.safeParse(output);
      if (!result.success) return { success: false };
      return {
        success: true,
        data: mergeResumeOutput(parsed.data, result.data),
      };
    },
  });
}
