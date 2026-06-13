import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/auth/supabase-middleware";

const protectedPrefixes = [
  "/dashboard",
  "/app",
  "/history",
  "/settings",
  "/onboarding",
];
const onboardingRequiredPrefixes = ["/dashboard", "/app", "/history", "/settings"];

async function isOnboardingCompleted(
  userId: string,
  supabase: NonNullable<Awaited<ReturnType<typeof updateSession>>["supabase"]>
) {
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  return data?.onboarding_completed === true;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const authCode = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const authType = searchParams.get("type");

  if (
    pathname !== "/auth/callback" &&
    (authCode || (tokenHash && authType))
  ) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    if (!callbackUrl.searchParams.has("redirect")) {
      callbackUrl.searchParams.set("redirect", "/dashboard");
    }
    return NextResponse.redirect(callbackUrl);
  }

  const { supabaseResponse, user, supabase } = await updateSession(request);

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && supabase) {
    const needsOnboarding = onboardingRequiredPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (needsOnboarding || pathname.startsWith("/onboarding")) {
      const completed = await isOnboardingCompleted(user.id, supabase);

      if (needsOnboarding && !completed) {
        const onboardingUrl = request.nextUrl.clone();
        onboardingUrl.pathname = "/onboarding";
        return NextResponse.redirect(onboardingUrl);
      }

      if (pathname.startsWith("/onboarding") && completed) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ads\\.txt|robots\\.txt|dc6c0320ccffdc85735e\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
