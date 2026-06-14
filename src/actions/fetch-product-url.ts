"use server";

import { getEntitlements } from "@/lib/auth/entitlements";
import { createClient } from "@/lib/auth/supabase-server";
import { fetchProductFromUrl } from "@/lib/product-url/fetch-product";
import { fetchedProductSchema } from "@/lib/validations/video-ad-script";

export type FetchProductResult =
  | { success: true; data: ReturnType<typeof fetchedProductSchema.parse> }
  | {
      success: false;
      error: string;
      code?: "unauthorized" | "quota_exceeded";
    };

export async function fetchProductFromUrlAction(url: unknown): Promise<FetchProductResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in first.", code: "unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const entitlements = getEntitlements({
    plan: profile?.plan ?? "free",
    plan_expires_at: profile?.plan_expires_at ?? null,
  });

  if (!entitlements.canImportProductUrl) {
    return {
      success: false,
      error: "Upgrade to Pro to import products from URLs.",
      code: "quota_exceeded",
    };
  }

  if (typeof url !== "string" || !url.trim()) {
    return { success: false, error: "Please enter a valid product URL." };
  }

  try {
    const product = await fetchProductFromUrl(url.trim());
    const parsed = fetchedProductSchema.safeParse(product);
    if (!parsed.success) {
      return { success: false, error: "Could not parse product data." };
    }
    return { success: true, data: parsed.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch product.",
    };
  }
}
