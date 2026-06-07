"use server";

import { createClient } from "@/lib/auth/supabase-server";
import { getEntitlements } from "@/lib/auth/entitlements";
import { logAuditEvent } from "@/lib/audit/audit-service";
import type { Tool } from "@/types";

export async function saveResult(params: {
  tool: Tool;
  title: string;
  content: Record<string, unknown>;
  generationId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  const entitlements = getEntitlements({ plan: profile.plan });
  if (!entitlements.canSaveHistory) {
    return { success: false, error: "Upgrade to Pro to save results." };
  }

  if (params.generationId) {
    const { data: existing } = await supabase
      .from("saved_results")
      .select("id")
      .eq("user_id", user.id)
      .eq("generation_id", params.generationId)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: "This result is already saved.",
        code: "already_saved" as const,
      };
    }
  }

  const { data, error } = await supabase
    .from("saved_results")
    .insert({
      user_id: user.id,
      generation_id: params.generationId ?? null,
      tool: params.tool,
      title: params.title,
      content: params.content,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAuditEvent({
    action: "save_result",
    resourceType: params.tool,
    resourceId: data.id,
  });

  return { success: true, id: data.id };
}
