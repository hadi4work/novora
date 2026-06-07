import { createClient, createServiceClient } from "@/lib/auth/supabase-server";
import { getEntitlements } from "@/lib/auth/entitlements";
import { getAdRewardStatus } from "@/lib/quota/ad-reward-service";
import type { Profile, Tool, UsageInfo } from "@/types";

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function getDailyUsage(userId: string, tool?: Tool): Promise<number> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("usage_tracking")
    .select("count")
    .eq("user_id", userId)
    .eq("date", today);

  if (tool) {
    query = query.eq("tool", tool);
  }

  const { data } = await query;

  if (!data?.length) return 0;
  return data.reduce((sum, row) => sum + (row.count ?? 0), 0);
}

export async function getUsageInfo(profile: Profile): Promise<UsageInfo> {
  const entitlements = getEntitlements(profile);
  const used = await getDailyUsage(profile.id);

  if (entitlements.dailyGenerationLimit === null) {
    return { used, limit: null, remaining: null, isUnlimited: true };
  }

  const adReward = await getAdRewardStatus(profile.id);
  const effectiveLimit =
    entitlements.dailyGenerationLimit + adReward.bonusGenerations;

  return {
    used,
    limit: entitlements.dailyGenerationLimit,
    remaining: Math.max(0, effectiveLimit - used),
    isUnlimited: false,
    adBonus: adReward.bonusGenerations,
    adRewardsRemaining: adReward.grantsRemaining,
  };
}

export async function checkAndIncrementUsage(
  userId: string,
  tool: Tool,
  dailyLimit: number | null
): Promise<{ allowed: boolean; used: number; limit: number | null }> {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient.rpc("increment_usage", {
    p_user_id: userId,
    p_tool: tool,
    p_daily_limit: dailyLimit,
  });

  if (error) {
    throw new Error("Failed to check usage quota");
  }

  const result = data as { allowed: boolean; used: number; limit: number | null };
  return result;
}

export async function decrementUsage(userId: string, tool: Tool): Promise<void> {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient.rpc("decrement_usage", {
    p_user_id: userId,
    p_tool: tool,
  });

  if (error) {
    console.error("Failed to rollback usage:", error);
  }
}
