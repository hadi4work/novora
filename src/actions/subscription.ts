"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/auth/supabase-server";
import {
  createCheckout,
  createPendingPayment,
  createPortal,
} from "@/lib/payments/payment-service";
import { logAuditEvent } from "@/lib/audit/audit-service";
import { APP_URL } from "@/lib/constants";

function checkoutErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("BTCPAY_URL is not configured")) {
      return "Payment is not configured. Set BTCPAY_URL on the server.";
    }
    if (message.includes("BTCPAY_API_KEY is not configured")) {
      return "Payment is not configured. Set BTCPAY_API_KEY on the server.";
    }
    if (message.includes("BTCPAY_STORE_ID is not configured")) {
      return "Payment is not configured. Set BTCPAY_STORE_ID on the server.";
    }
    if (message.includes("Full node not available")) {
      return "Bitcoin payments are temporarily unavailable while the BTCPay node finishes syncing. Please try again in a few hours, or check BTCPay Server for sync progress.";
    }
    if (message.includes("BTCPay API error")) {
      return "Payment server error. Please try again shortly or contact support if this continues.";
    }
    if (message.includes("Failed to create pending payment")) {
      return message;
    }

    return message;
  }

  return "Checkout failed. Please try again.";
}

export async function startCheckout(plan: "pro" | "business") {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?redirect=/pricing");
    }

    const provider = process.env.PAYMENT_PROVIDER ?? "manual";

    if (provider === "manual" && process.env.NODE_ENV !== "production") {
      const result = await completeManualUpgrade(plan);
      if (result.error) {
        redirect(`/pricing?error=${encodeURIComponent(result.error)}`);
      }
      redirect("/dashboard");
    }

    if (provider === "btcpay" && process.env.NODE_ENV === "production") {
      const missing = [
        !process.env.BTCPAY_URL && "BTCPAY_URL",
        !process.env.BTCPAY_API_KEY && "BTCPAY_API_KEY",
        !process.env.BTCPAY_STORE_ID && "BTCPAY_STORE_ID",
      ].filter(Boolean);

      if (missing.length > 0) {
        redirect(
          `/pricing?error=${encodeURIComponent(`Missing server env: ${missing.join(", ")}`)}`
        );
      }
    }

    let paymentRef: string | undefined;

    if (provider === "btcpay") {
      paymentRef = await createPendingPayment({
        userId: user.id,
        plan,
        email: user.email!,
      });
    }

    const successUrl = paymentRef
      ? `${APP_URL}/dashboard?checkout=pending&payment=${paymentRef}`
      : `${APP_URL}/dashboard?checkout=success`;

    const session = await createCheckout({
      userId: user.id,
      email: user.email!,
      plan,
      successUrl,
      cancelUrl: `${APP_URL}/pricing`,
      paymentRef,
    });

    redirect(session.url);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("startCheckout failed:", error);
    redirect(`/pricing?error=${encodeURIComponent(checkoutErrorMessage(error))}`);
  }
}

export async function openBillingPortal(): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to manage your plan." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("provider_customer_id, provider, provider_subscription_id, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    return { error: "No active subscription found." };
  }

  if (
    subscription.provider === "manual" ||
    subscription.provider === "btcpay" ||
    !subscription.provider_customer_id
  ) {
    return { url: "/pricing" };
  }

  const portal = await createPortal(subscription.provider_customer_id);
  return { url: portal.url };
}

export async function cancelUserSubscription() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const serviceClient = createServiceClient();
  const { data: subscription } = await serviceClient
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) return { error: "No active subscription found." };

  await serviceClient
    .from("subscriptions")
    .update({ status: "canceled", cancel_at_period_end: true })
    .eq("id", subscription.id);

  await serviceClient
    .from("profiles")
    .update({ plan: "free", plan_expires_at: null })
    .eq("id", user.id);

  await logAuditEvent({
    action: "subscription_cancel",
    resourceType: "subscription",
    resourceId: subscription.provider_subscription_id,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function completeManualUpgrade(plan: "pro" | "business") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  if (
    process.env.PAYMENT_PROVIDER !== "manual" ||
    process.env.NODE_ENV === "production"
  ) {
    return { error: "Manual upgrade not available" };
  }

  const serviceClient = createServiceClient();
  const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
  const subscriptionId = `manual_${user.id}_${Date.now()}`;

  await serviceClient.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan,
      status: "active",
      provider: "manual",
      provider_subscription_id: subscriptionId,
      provider_customer_id: `manual_${user.id}`,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    },
    { onConflict: "provider,provider_subscription_id" }
  );

  await serviceClient
    .from("profiles")
    .update({ plan, plan_expires_at: periodEnd })
    .eq("id", user.id);

  await logAuditEvent({
    action: "plan_upgrade",
    resourceType: "subscription",
    resourceId: subscriptionId,
    metadata: { plan, provider: "manual" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { success: true, plan };
}
