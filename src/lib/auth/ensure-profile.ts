import { createServiceClient } from "@/lib/auth/supabase-server";
import type { User } from "@supabase/supabase-js";

export async function ensureUserProfile(user: User) {
  try {
    const serviceClient = createServiceClient();

    const email =
      user.email ??
      (user.user_metadata?.email as string | undefined) ??
      `${user.id}@novora.local`;

    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null;

    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null;

    await serviceClient.from("profiles").upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
      },
      { onConflict: "id" }
    );

    await serviceClient.from("settings").upsert(
      { user_id: user.id },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  } catch (error) {
    console.error("ensureUserProfile failed:", error);
  }
}
