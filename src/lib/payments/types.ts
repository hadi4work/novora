export interface CheckoutParams {
  userId: string;
  email: string;
  plan: "pro" | "business";
  successUrl: string;
  cancelUrl: string;
  paymentRef?: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface PortalSession {
  url: string;
}

export interface WebhookEvent {
  type: string;
  provider: string;
  providerEventId: string;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  providerPaymentId?: string;
  userId?: string;
  plan?: "pro" | "business";
  status?: "active" | "past_due" | "canceled" | "trialing" | "paused";
  amountCents?: number;
  currency?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession>;
  createPortalSession(customerId: string): Promise<PortalSession>;
  verifyWebhook(payload: string, signature: string): WebhookEvent;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
