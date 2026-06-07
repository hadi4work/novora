import { createServiceClient } from "@/lib/auth/supabase-server";
import {
  AD_WATCH_SECONDS,
  MAX_AD_REWARDS_PER_DAY,
} from "@/lib/constants";

export interface AdRewardStatus {
  bonusGenerations: number;
  grantsUsed: number;
  grantsRemaining: number;
  canWatchAd: boolean;
}

export async function getAdRewardStatus(userId: string): Promise<AdRewardStatus> {
  const serviceClient = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await serviceClient
    .from("ad_reward_grants")
    .select("count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  const grantsUsed = data?.count ?? 0;
  const grantsRemaining = Math.max(0, MAX_AD_REWARDS_PER_DAY - grantsUsed);

  return {
    bonusGenerations: grantsUsed,
    grantsUsed,
    grantsRemaining,
    canWatchAd: grantsRemaining > 0,
  };
}

export async function grantAdReward(userId: string): Promise<{
  success: boolean;
  error?: string;
  grantsRemaining?: number;
  bonusGenerations?: number;
}> {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient.rpc("grant_ad_reward", {
    p_user_id: userId,
    p_max_per_day: MAX_AD_REWARDS_PER_DAY,
    p_min_seconds: AD_WATCH_SECONDS,
  });

  if (error) {
    return { success: false, error: "Failed to grant ad reward." };
  }

  const result = data as {
    success: boolean;
    error?: string;
    grants_remaining?: number;
    bonus_generations?: number;
  };

  if (!result.success) {
    const message =
      result.error === "daily_ad_limit_reached"
        ? "You have watched the maximum number of ads for today."
        : result.error === "too_soon"
          ? "Please finish watching the full ad before claiming your reward."
          : "Could not grant reward. Please try again.";

    return { success: false, error: message };
  }

  return {
    success: true,
    grantsRemaining: result.grants_remaining,
    bonusGenerations: result.bonus_generations,
  };
}
