"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth/supabase-server";
import { logAuditEvent } from "@/lib/audit/audit-service";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const fullName = formData.get("fullName") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await logAuditEvent({ action: "profile_update", resourceType: "profile" });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeOnboarding(role: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await logAuditEvent({
    action: "onboarding_complete",
    resourceType: "profile",
    metadata: { role },
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return { success: true };
}
