import type {
  CheckoutParams,
  CheckoutSession,
  PaymentProvider,
  PortalSession,
  WebhookEvent,
} from "@/lib/payments/types";

export class ManualPaymentProvider implements PaymentProvider {
  name = "manual";

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    const sessionId = `manual_${params.userId}_${params.plan}_${Date.now()}`;
    const url = new URL(params.successUrl);
    url.searchParams.set("session_id", sessionId);
    url.searchParams.set("plan", params.plan);
    url.searchParams.set("provider", "manual");
    url.searchParams.set("upgraded", "true");

    return { url: url.toString(), sessionId };
  }

  async createPortalSession(): Promise<PortalSession> {
    return { url: "/settings?tab=billing" };
  }

  verifyWebhook(payload: string): WebhookEvent {
    const data = JSON.parse(payload) as WebhookEvent;
    return data;
  }

  async cancelSubscription(): Promise<void> {
    // No-op for manual provider
  }
}
