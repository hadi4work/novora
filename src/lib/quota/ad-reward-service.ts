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

async function grantAdRewardDirect(userId: string): Promise<{
  success: boolean;
  error?: string;
  grantsRemaining?: number;
  bonusGenerations?: number;
}> {
  const serviceClient = createServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  const { data: row, error: readError } = await serviceClient
    .from("ad_reward_grants")
    .select("count, last_granted_at")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (readError) {
    console.error("ad_reward_grants read error:", readError.message);
    return { success: false, error: "rpc_failed" };
  }

  const count = row?.count ?? 0;
  const lastGranted = row?.last_granted_at;

  if (count >= MAX_AD_REWARDS_PER_DAY) {
    return { success: false, error: "daily_ad_limit_reached" };
  }

  if (lastGranted) {
    const elapsedMs = Date.now() - new Date(lastGranted).getTime();
    if (elapsedMs < AD_WATCH_SECONDS * 1000) {
      return { success: false, error: "too_soon" };
    }
  }

  const newCount = count + 1;

  if (row) {
    const { error: updateError } = await serviceClient
      .from("ad_reward_grants")
      .update({ count: newCount, last_granted_at: now })
      .eq("user_id", userId)
      .eq("date", today);

    if (updateError) {
      console.error("ad_reward_grants update error:", updateError.message);
      return { success: false, error: "rpc_failed" };
    }
  } else {
    const { error: insertError } = await serviceClient
      .from("ad_reward_grants")
      .insert({
        user_id: userId,
        date: today,
        count: 1,
        last_granted_at: now,
      });

    if (insertError) {
      console.error("ad_reward_grants insert error:", insertError.message);
      return { success: false, error: "rpc_failed" };
    }
  }

  return {
    success: true,
    grantsRemaining: Math.max(0, MAX_AD_REWARDS_PER_DAY - newCount),
    bonusGenerations: newCount,
  };
}

export async function grantAdReward(userId: string): Promise<{
  success: boolean;
  error?: string;
  grantsRemaining?: number;
  bonusGenerations?: number;
}> {
  try {
    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient.rpc("grant_ad_reward", {
      p_user_id: userId,
      p_max_per_day: MAX_AD_REWARDS_PER_DAY,
      p_min_seconds: AD_WATCH_SECONDS,
    });

    if (!error && data) {
      const result = data as {
        success: boolean;
        error?: string;
        grants_remaining?: number;
        bonus_generations?: number;
      };

      if (result.success) {
        return {
          success: true,
          grantsRemaining: result.grants_remaining,
          bonusGenerations: result.bonus_generations,
        };
      }

      if (result.error === "daily_ad_limit_reached") {
        return { success: false, error: "daily_ad_limit_reached" };
      }

      if (result.error === "too_soon") {
        return { success: false, error: "too_soon" };
      }
    }

    if (error) {
      console.error("grant_ad_reward RPC error:", error.message);
    }
  } catch (error) {
    console.error("grant_ad_reward RPC unavailable:", error);
  }

  return grantAdRewardDirect(userId);
}
