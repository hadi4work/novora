"use server";

import { redirect } from "next/navigation";
import { getAuthCallbackUrl } from "@/lib/auth/app-url";
import { createClient } from "@/lib/auth/supabase-server";
import { logAuditEvent } from "@/lib/audit/audit-service";

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  await logAuditEvent({ action: "login", resourceType: "auth", metadata: { method: "email" } });
  redirect(redirectTo);
}

function resolveAuthCallbackUrl(formData: FormData, redirectPath = "/dashboard") {
  const callbackOrigin = formData.get("callbackOrigin") as string | null;
  if (callbackOrigin) {
    const origin = callbackOrigin.replace(/\/$/, "");
    const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
    return `${origin}/auth/callback?redirect=${encodeURIComponent(path)}`;
  }
  return getAuthCallbackUrl(redirectPath);
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: resolveAuthCallbackUrl(formData, "/dashboard"),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Check your email to confirm your account." };
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthCallbackUrl("/settings"),
  });

  if (error) return { error: error.message };

  return {
    success: true,
    message: "Check your email for a password reset link.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  try {
    await logAuditEvent({ action: "logout", resourceType: "auth" });
  } catch {
    // Don't block sign-out if audit logging fails
  }
  await supabase.auth.signOut();
  redirect("/");
}
