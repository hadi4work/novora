import { LemonSqueezyProvider } from "@/lib/payments/providers/lemonsqueezy";
import { ManualPaymentProvider } from "@/lib/payments/providers/manual";
import { NexaPayProvider } from "@/lib/payments/providers/nexapay";
import type { CheckoutParams, PaymentProvider, WebhookEvent } from "@/lib/payments/types";
import { createServiceClient } from "@/lib/auth/supabase-server";
import { logAuditEvent } from "@/lib/audit/audit-service";
import { PLAN_PRICES } from "@/lib/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

function getProvider(): PaymentProvider {
  const providerName = process.env.PAYMENT_PROVIDER ?? "manual";

  switch (providerName) {
    case "nexapay":
      return new NexaPayProvider();
    case "lemonsqueezy":
      return new LemonSqueezyProvider();
    default:
      return new ManualPaymentProvider();
  }
}

function getProviderByName(providerName: string): PaymentProvider {
  switch (providerName) {
    case "nexapay":
      return new NexaPayProvider();
    case "lemonsqueezy":
      return new LemonSqueezyProvider();
    default:
      return new ManualPaymentProvider();
  }
}

export async function createPendingPayment(params: {
  userId: string;
  plan: "pro" | "business";
  email: string;
}): Promise<string> {
  const serviceClient = createServiceClient();
  const paymentRef = crypto.randomUUID();
  const amountCents = PLAN_PRICES[params.plan].monthly * 100;

  const { error } = await serviceClient.from("payments").insert({
    user_id: params.userId,
    provider: "nexapay",
    provider_payment_id: paymentRef,
    amount_cents: amountCents,
    currency: "USD",
    status: "pending",
    metadata: { plan: params.plan, email: params.email },
  });

  if (error) {
    throw new Error(`Failed to create pending payment: ${error.message}`);
  }

  return paymentRef;
}

export async function createCheckout(params: CheckoutParams) {
  const provider = getProvider();
  return provider.createCheckoutSession(params);
}

export async function createPortal(customerId: string) {
  const provider = getProvider();
  return provider.createPortalSession(customerId);
}

export async function cancelSubscription(subscriptionId: string) {
  const provider = getProvider();
  return provider.cancelSubscription(subscriptionId);
}

export function verifyWebhook(
  providerName: string,
  payload: string,
  signature: string
): WebhookEvent {
  const provider = getProviderByName(providerName);
  return provider.verifyWebhook(payload, signature);
}

async function handleNexaPayEvent(
  event: WebhookEvent,
  serviceClient: SupabaseClient
) {
  const paymentId = event.providerEventId;

  const { data: payment } = await serviceClient
    .from("payments")
    .select("*")
    .eq("provider", "nexapay")
    .eq("provider_payment_id", paymentId)
    .maybeSingle();

  if (!payment) return;
  if (payment.status === "succeeded") return;

  if (event.type === "payment.failed") {
    await serviceClient
      .from("payments")
      .update({ status: "failed", metadata: event.metadata ?? {} })
      .eq("id", payment.id);
    return;
  }

  if (event.type !== "payment.success" || !event.plan || !event.userId) {
    return;
  }

  const periodStart = event.currentPeriodStart ?? new Date().toISOString();
  const periodEnd =
    event.currentPeriodEnd ??
    new Date(Date.now() + 30 * 86400000).toISOString();

  await serviceClient
    .from("payments")
    .update({
      status: "succeeded",
      metadata: {
        ...(payment.metadata as Record<string, unknown>),
        nexapay_transaction_id: event.providerPaymentId,
        webhook: event.metadata ?? {},
      },
    })
    .eq("id", payment.id);

  await serviceClient.from("subscriptions").upsert(
    {
      user_id: event.userId,
      plan: event.plan,
      status: "active",
      provider: "nexapay",
      provider_subscription_id: event.providerSubscriptionId!,
      provider_customer_id: event.userId,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      metadata: event.metadata ?? {},
    },
    { onConflict: "provider,provider_subscription_id" }
  );

  await serviceClient
    .from("profiles")
    .update({
      plan: event.plan,
      plan_expires_at: periodEnd,
    })
    .eq("id", event.userId);

  await logAuditEvent({
    action: "payment_event",
    resourceType: "subscription",
    resourceId: event.providerSubscriptionId,
    metadata: { type: event.type, plan: event.plan, provider: "nexapay" },
    userId: event.userId,
  });
}

export async function handleSubscriptionEvent(event: WebhookEvent) {
  if (!event.userId) return;

  const serviceClient = createServiceClient();

  if (event.provider === "nexapay") {
    await handleNexaPayEvent(event, serviceClient);
    return;
  }

  const existingPayment = await serviceClient
    .from("payments")
    .select("id")
    .eq("provider", event.provider)
    .eq("provider_payment_id", event.providerEventId)
    .eq("status", "succeeded")
    .maybeSingle();

  if (existingPayment.data) return;

  if (event.type.includes("subscription") || event.type.includes("order")) {
    if (event.providerSubscriptionId && event.plan && event.status) {
      await serviceClient.from("subscriptions").upsert(
        {
          user_id: event.userId,
          plan: event.plan,
          status: event.status,
          provider: event.provider,
          provider_subscription_id: event.providerSubscriptionId,
          provider_customer_id: event.providerCustomerId,
          current_period_start:
            event.currentPeriodStart ?? new Date().toISOString(),
          current_period_end:
            event.currentPeriodEnd ??
            new Date(Date.now() + 30 * 86400000).toISOString(),
          cancel_at_period_end: event.cancelAtPeriodEnd ?? false,
          metadata: event.metadata ?? {},
        },
        { onConflict: "provider,provider_subscription_id" }
      );

      const activePlan =
        event.status === "active" || event.status === "trialing"
          ? event.plan
          : "free";

      if (activePlan !== "free") {
        await serviceClient
          .from("profiles")
          .update({
            plan: activePlan,
            plan_expires_at: event.currentPeriodEnd,
          })
          .eq("id", event.userId);
      } else if (event.status === "canceled") {
        await serviceClient
          .from("profiles")
          .update({ plan: "free", plan_expires_at: null })
          .eq("id", event.userId);
      }
    }

    if (event.providerPaymentId && event.amountCents) {
      await serviceClient.from("payments").insert({
        user_id: event.userId,
        provider: event.provider,
        provider_payment_id: event.providerEventId,
        amount_cents: event.amountCents,
        currency: event.currency ?? "USD",
        status: "succeeded",
        metadata: event.metadata ?? {},
      });
    }

    await logAuditEvent({
      action: "payment_event",
      resourceType: "subscription",
      resourceId: event.providerSubscriptionId,
      metadata: { type: event.type, plan: event.plan },
      userId: event.userId,
    });
  }
}

export async function getPaymentStatus(paymentRef: string, userId: string) {
  const serviceClient = createServiceClient();

  const { data: payment } = await serviceClient
    .from("payments")
    .select("status, metadata")
    .eq("provider_payment_id", paymentRef)
    .eq("user_id", userId)
    .maybeSingle();

  if (!payment) {
    return { status: "not_found" as const };
  }

  const metadata = payment.metadata as { plan?: string } | null;

  return {
    status: payment.status as "pending" | "succeeded" | "failed",
    plan: metadata?.plan ?? null,
  };
}
