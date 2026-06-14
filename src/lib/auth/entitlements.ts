import { PLAN_LIMITS } from "@/lib/constants";
import type { Entitlements, Plan, Profile } from "@/types";

export function getEffectivePlan(
  profile: Pick<Profile, "plan"> & Partial<Pick<Profile, "plan_expires_at">>
): Plan {
  if (profile.plan !== "free" && profile.plan_expires_at) {
    if (new Date(profile.plan_expires_at) < new Date()) {
      return "free";
    }
  }
  return profile.plan as Plan;
}

export function getEntitlements(
  profile: Pick<Profile, "plan"> & Partial<Pick<Profile, "plan_expires_at">>
): Entitlements {
  const plan = getEffectivePlan(profile);
  const limits = PLAN_LIMITS[plan];

  return {
    plan,
    dailyGenerationLimit: limits.dailyGenerations,
    maxVariations: limits.maxVariations,
    canExportPdf: limits.canExportPdf,
    canSaveHistory: limits.canSaveHistory,
    showAds: limits.showAds,
    model: limits.model,
    allowedPlatforms: limits.allowedPlatforms,
    socialMediaTones: limits.socialMediaTones,
    productTones: limits.productTones,
    productDescriptionFormats: limits.productDescriptionFormats,
    videoAdTones: limits.videoAdTones,
    videoAdDurations: limits.videoAdDurations,
    canImportProductUrl: limits.canImportProductUrl,
  };
}

export function isPaidPlan(plan: Plan): boolean {
  return plan === "pro" || plan === "business";
}
