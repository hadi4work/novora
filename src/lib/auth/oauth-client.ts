"use client";

import { createClient } from "@/lib/auth/supabase-client";

export async function startGoogleOAuth(redirectPath = "/dashboard") {
  const supabase = createClient();
  const origin = window.location.origin;
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  const redirectTo = `${origin}/auth/callback?redirect=${encodeURIComponent(path)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    window.location.assign(data.url);
  }

  return {};
}
