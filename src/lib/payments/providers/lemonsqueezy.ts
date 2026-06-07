import { createHmac, timingSafeEqual } from "crypto";
import type {
  CheckoutParams,
  CheckoutSession,
  PaymentProvider,
  PortalSession,
  WebhookEvent,
} from "@/lib/payments/types";

const API_BASE = "https://api.lemonsqueezy.com/v1";

export class LemonSqueezyProvider implements PaymentProvider {
  name = "lemonsqueezy";

  private get apiKey() {
    return process.env.LEMONSQUEEZY_API_KEY!;
  }

  private get storeId() {
    return process.env.LEMONSQUEEZY_STORE_ID!;
  }

  private getVariantId(plan: "pro" | "business"): string {
    return plan === "pro"
      ? process.env.LEMONSQUEEZY_PRO_VARIANT_ID!
      : process.env.LEMONSQUEEZY_BUSINESS_VARIANT_ID!;
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    const response = await fetch(`${API_BASE}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_options: {
              embed: false,
            },
            checkout_data: {
              email: params.email,
              custom: {
                user_id: params.userId,
                plan: params.plan,
              },
            },
            product_options: {
              redirect_url: params.successUrl,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: this.storeId } },
            variant: { data: { type: "variants", id: this.getVariantId(params.plan) } },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const json = await response.json();
    return {
      url: json.data.attributes.url,
      sessionId: json.data.id,
    };
  }

  async createPortalSession(customerId: string): Promise<PortalSession> {
    return { url: `https://app.lemonsqueezy.com/my-orders?customer=${customerId}` };
  }

  verifyWebhook(payload: string, signature: string): WebhookEvent {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = createHmac("sha256", secret).update(payload).digest("hex");

    const sigBuffer = Buffer.from(signature);
    const hmacBuffer = Buffer.from(hmac);

    if (sigBuffer.length !== hmacBuffer.length || !timingSafeEqual(sigBuffer, hmacBuffer)) {
      throw new Error("Invalid webhook signature");
    }

    const body = JSON.parse(payload);
    const eventName = body.meta?.event_name ?? "";
    const attrs = body.data?.attributes ?? {};
    const customData = body.meta?.custom_data ?? attrs.custom_data ?? {};

    return {
      type: eventName,
      provider: this.name,
      providerEventId: body.meta?.webhook_id ?? `${eventName}_${body.data?.id}`,
      providerSubscriptionId: String(body.data?.id ?? ""),
      providerCustomerId: String(attrs.customer_id ?? ""),
      providerPaymentId: String(attrs.order_id ?? body.data?.id ?? ""),
      userId: customData.user_id,
      plan: customData.plan as "pro" | "business" | undefined,
      status: mapLemonStatus(attrs.status),
      amountCents: attrs.total ? Math.round(attrs.total) : undefined,
      currency: attrs.currency ?? "USD",
      currentPeriodStart: attrs.created_at,
      currentPeriodEnd: attrs.renews_at ?? attrs.ends_at,
      cancelAtPeriodEnd: attrs.cancelled === true,
      metadata: body,
    };
  }

  private planFromVariant(variantId: string): "pro" | "business" | undefined {
    if (variantId && variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) {
      return "pro";
    }
    if (variantId && variantId === process.env.LEMONSQUEEZY_BUSINESS_VARIANT_ID) {
      return "business";
    }
    return undefined;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/vnd.api+json",
      },
    });
  }
}

function mapLemonStatus(
  status: string
): WebhookEvent["status"] {
  const map: Record<string, WebhookEvent["status"]> = {
    active: "active",
    on_trial: "trialing",
    paused: "paused",
    past_due: "past_due",
    cancelled: "canceled",
    expired: "canceled",
  };
  return map[status] ?? "active";
}
