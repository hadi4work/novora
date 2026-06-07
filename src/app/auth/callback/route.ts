import { NextResponse } from "next/server";
import { createClient } from "@/lib/auth/supabase-server";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";
import { logAuditEvent } from "@/lib/audit/audit-service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const authError = searchParams.get("error_description") ?? searchParams.get("error");

  if (authError && !code) {
    const message = encodeURIComponent(authError);
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await ensureUserProfile(data.user);
      await logAuditEvent({
        action: "login",
        resourceType: "auth",
        metadata: { method: "oauth" },
      });
      return NextResponse.redirect(`${origin}${redirect}`);
    }

    if (error) {
      const message = encodeURIComponent(error.message);
      return NextResponse.redirect(`${origin}/login?error=${message}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
