"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth/supabase-server";
import {
  getAdRewardStatus,
  grantAdReward,
} from "@/lib/quota/ad-reward-service";

export async function getAdRewardInfo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan !== "free") {
    return {
      canWatchAd: false,
      grantsRemaining: 0,
      bonusGenerations: 0,
    };
  }

  return getAdRewardStatus(user.id);
}

export async function claimAdReward() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan !== "free") {
    return { success: false, error: "Ad rewards are only available on the free plan." };
  }

  const result = await grantAdReward(user.id);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/app/social-media");
    revalidatePath("/app/product-description");
    revalidatePath("/app/video-ad-script");
    revalidatePath("/app/resume");
  }

  return result;
}
