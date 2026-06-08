import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/auth/app-url";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/auth/env";
import { logAuditEvent } from "@/lib/audit/audit-service";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const redirectParam = searchParams.get("redirect") ?? "/dashboard";
  const redirectPath = redirectParam.startsWith("/") ? redirectParam : `/${redirectParam}`;
  const origin = getAppOrigin(request);

  const authError = searchParams.get("error_description") ?? searchParams.get("error");

  if (authError && !code) {
    const message = encodeURIComponent(authError);
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const redirectTo = `${origin}${redirectPath}`;
  let response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const message = encodeURIComponent(error?.message ?? "auth_callback_failed");
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  await ensureUserProfile(data.user);

  try {
    await logAuditEvent({
      action: "login",
      resourceType: "auth",
      metadata: { method: "oauth" },
      userId: data.user.id,
    });
  } catch {
    // Don't block login if audit logging fails
  }

  return response;
}
