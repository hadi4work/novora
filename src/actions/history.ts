"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth/supabase-server";
import { logAuditEvent } from "@/lib/audit/audit-service";

export async function deleteGeneration(generationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("generations")
    .delete()
    .eq("id", generationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  await logAuditEvent({
    action: "generation_delete",
    resourceType: "generation",
    resourceId: generationId,
  });

  revalidatePath("/history");
  return { success: true };
}
