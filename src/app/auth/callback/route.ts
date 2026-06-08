import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/auth/app-url";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/auth/env";
import { logAuditEvent } from "@/lib/audit/audit-service";

function applyAuthCookies(
  response: NextResponse,
  cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set({
      name,
      value,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      ...(options ?? {}),
    });
  });
}

function createAuthResponse(request: NextRequest, redirectPath: string) {
  const origin = getAppOrigin(request);
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  const response = NextResponse.redirect(`${origin}${path}`);

  const supabase = createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        applyAuthCookies(response, cookiesToSet);
      },
    },
  });

  return { supabase, response, origin };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const redirectParam = searchParams.get("redirect") ?? "/dashboard";
  const origin = getAppOrigin(request);

  const authError = searchParams.get("error_description") ?? searchParams.get("error");

  if (authError && !code && !tokenHash) {
    const message = encodeURIComponent(authError);
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const { supabase, response } = createAuthResponse(request, redirectParam);

  const authResult = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: type as EmailOtpType,
      });

  const user = authResult.data.user ?? authResult.data.session?.user;

  if (authResult.error || !user) {
    const message = encodeURIComponent(authResult.error?.message ?? "auth_callback_failed");
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  await ensureUserProfile(user);

  try {
    await logAuditEvent({
      action: "login",
      resourceType: "auth",
      metadata: { method: code ? "oauth" : "email" },
      userId: user.id,
    });
  } catch {
    // Don't block login if audit logging fails
  }

  return response;
}
