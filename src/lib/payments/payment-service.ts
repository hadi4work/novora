import { BtcpayProvider } from "@/lib/payments/providers/btcpay";
import { ManualPaymentProvider } from "@/lib/payments/providers/manual";
import type { CheckoutParams, PaymentProvider, WebhookEvent } from "@/lib/payments/types";
import { createServiceClient } from "@/lib/auth/supabase-server";
import { logAuditEvent } from "@/lib/audit/audit-service";
import { PLAN_PRICES } from "@/lib/constants";

function getProvider(): PaymentProvider {
  const providerName = process.env.PAYMENT_PROVIDER ?? "manual";

  switch (providerName) {
    case "btcpay":
      return new BtcpayProvider();
    default:
      return new ManualPaymentProvider();
  }
}

function getProviderByName(providerName: string): PaymentProvider {
  switch (providerName) {
    case "btcpay":
      return new BtcpayProvider();
    default:
      return new ManualPaymentProvider();
  }
}

export async function createPendingPayment(params: {
  userId: string;
  plan: "pro" | "business";
  email: string;
  btcpayInvoiceId?: string;
}): Promise<string> {
  const serviceClient = createServiceClient();
  const paymentRef = crypto.randomUUID();
  const amountCents = PLAN_PRICES[params.plan].monthly * 100;

  const { error } = await serviceClient.from("payments").insert({
    user_id: params.userId,
    provider: "btcpay",
    provider_payment_id: paymentRef,
    amount_cents: amountCents,
    currency: "USD",
    status: "pending",
    metadata: {
      plan: params.plan,
      email: params.email,
      btcpay_invoice_id: params.btcpayInvoiceId ?? null,
    },
  });

  if (error) {
    throw new Error(`Failed to create pending payment: ${error.message}`);
  }

  return paymentRef;
}

export async function attachBtcpayInvoiceId(
  paymentRef: string,
  invoiceId: string
) {
  const serviceClient = createServiceClient();

  const { data: payment } = await serviceClient
    .from("payments")
    .select("metadata")
    .eq("provider", "btcpay")
    .eq("provider_payment_id", paymentRef)
    .maybeSingle();

  if (!payment) return;

  await serviceClient
    .from("payments")
    .update({
      metadata: {
        ...(payment.metadata as Record<string, unknown>),
        btcpay_invoice_id: invoiceId,
      },
    })
    .eq("provider", "btcpay")
    .eq("provider_payment_id", paymentRef);
}

export async function createCheckout(params: CheckoutParams) {
  const provider = getProvider();
  const session = await provider.createCheckoutSession(params);

  if (provider.name === "btcpay" && params.paymentRef) {
    await attachBtcpayInvoiceId(params.paymentRef, session.sessionId);
  }

  return session;
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

export async function confirmProviderPayment(
  provider: string,
  paymentRef: string,
  options?: {
    providerPaymentId?: string;
    source?: "webhook";
    metadata?: Record<string, unknown>;
  }
) {
  const serviceClient = createServiceClient();

  const { data: payment } = await serviceClient
    .from("payments")
    .select("*")
    .eq("provider", provider)
    .eq("provider_payment_id", paymentRef)
    .maybeSingle();

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === "succeeded") {
    return { alreadyConfirmed: true as const, payment };
  }

  const paymentMetadata = payment.metadata as {
    plan?: "pro" | "business";
    email?: string;
  };

  const plan = paymentMetadata.plan;
  if (!plan) {
    throw new Error("Payment is missing plan metadata");
  }

  const userId = payment.user_id;
  const periodStart = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
  const providerSubscriptionId = `${provider}_${paymentRef}`;

  await serviceClient
    .from("payments")
    .update({
      status: "succeeded",
      metadata: {
        ...paymentMetadata,
        confirmed_at: new Date().toISOString(),
        confirmation_source: options?.source ?? "webhook",
        provider_invoice_id: options?.providerPaymentId ?? null,
        ...(options?.metadata ?? {}),
      },
    })
    .eq("id", payment.id);

  await serviceClient.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status: "active",
      provider,
      provider_subscription_id: providerSubscriptionId,
      provider_customer_id: userId,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      metadata: options?.metadata ?? {},
    },
    { onConflict: "provider,provider_subscription_id" }
  );

  await serviceClient
    .from("profiles")
    .update({
      plan,
      plan_expires_at: periodEnd,
    })
    .eq("id", userId);

  await logAuditEvent({
    action: "payment_confirmed",
    resourceType: "subscription",
    resourceId: providerSubscriptionId,
    metadata: {
      plan,
      provider,
      paymentRef,
      source: options?.source ?? "webhook",
    },
    userId,
  });

  return { alreadyConfirmed: false as const, payment, plan, userId };
}

async function handleBtcpayEvent(event: WebhookEvent) {
  const paymentId = event.providerEventId;

  const serviceClient = createServiceClient();

  const { data: payment } = await serviceClient
    .from("payments")
    .select("*")
    .eq("provider", "btcpay")
    .eq("provider_payment_id", paymentId)
    .maybeSingle();

  if (!payment) return;
  if (payment.status === "succeeded") return;

  if (event.type === "payment.failed") {
    await serviceClient
      .from("payments")
      .update({
        status: "failed",
        metadata: {
          ...(payment.metadata as Record<string, unknown>),
          ...(event.metadata ?? {}),
        },
      })
      .eq("id", payment.id);
    return;
  }

  if (event.type !== "payment.success" || !event.plan || !event.userId) {
    return;
  }

  await confirmProviderPayment("btcpay", paymentId, {
    providerPaymentId: event.providerPaymentId,
    source: "webhook",
    metadata: event.metadata ?? {},
  });
}

export async function handleSubscriptionEvent(event: WebhookEvent) {
  if (event.type === "payment.ignored") return;

  if (event.provider === "btcpay") {
    await handleBtcpayEvent(event);
    return;
  }

  if (!event.userId) return;
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
