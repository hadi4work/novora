import { createHmac, timingSafeEqual } from "crypto";
import { APP_URL } from "@/lib/constants";
import { PLAN_PRICES } from "@/lib/constants";
import {
  encodeBtcpayMetadata,
  parseBtcpayMetadata,
} from "@/lib/payments/btcpay-metadata";
import type {
  CheckoutParams,
  CheckoutSession,
  PaymentProvider,
  PortalSession,
  WebhookEvent,
} from "@/lib/payments/types";

interface BtcpayInvoiceResponse {
  id?: string;
  checkoutLink?: string;
}

interface BtcpayWebhookPayload {
  type?: string;
  invoiceId?: string;
  metadata?: Record<string, unknown>;
  storeId?: string;
}

const PLAN_LABELS: Record<"pro" | "business", string> = {
  pro: "Novora Pro — 30 days",
  business: "Novora Business — 30 days",
};

const SETTLED_EVENTS = new Set(["InvoiceSettled", "InvoicePaymentSettled"]);
const FAILED_EVENTS = new Set(["InvoiceExpired", "InvoiceInvalid"]);

export class BtcpayProvider implements PaymentProvider {
  name = "btcpay";

  private get baseUrl() {
    const url = process.env.BTCPAY_URL;
    if (!url) throw new Error("BTCPAY_URL is not configured");
    return url.replace(/\/$/, "");
  }

  private get apiKey() {
    const key = process.env.BTCPAY_API_KEY;
    if (!key) throw new Error("BTCPAY_API_KEY is not configured");
    return key;
  }

  private get storeId() {
    const id = process.env.BTCPAY_STORE_ID;
    if (!id) throw new Error("BTCPAY_STORE_ID is not configured");
    return id;
  }

  private get webhookUrl() {
    return `${APP_URL}/api/webhooks/btcpay`;
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    if (!params.paymentRef) {
      throw new Error("paymentRef is required for BTCPay checkout");
    }

    const amount = PLAN_PRICES[params.plan].monthly;

    const response = await fetch(
      `${this.baseUrl}/api/v1/stores/${this.storeId}/invoices`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          currency: "USD",
          metadata: encodeBtcpayMetadata({
            orderId: params.paymentRef,
            userId: params.userId,
            plan: params.plan,
            email: params.email,
          }),
          checkout: {
            redirectURL: params.successUrl,
            redirectAutomatically: true,
            speedPolicy: "MediumSpeed",
          },
          notificationURL: this.webhookUrl,
          additionalSearchTerms: [params.paymentRef],
          itemDesc: PLAN_LABELS[params.plan],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BTCPay API error: ${errorText || response.statusText}`);
    }

    const data = (await response.json()) as BtcpayInvoiceResponse;

    if (!data.checkoutLink || !data.id) {
      throw new Error("BTCPay did not return a checkout link");
    }

    return {
      url: data.checkoutLink,
      sessionId: data.id,
    };
  }

  async createPortalSession(): Promise<PortalSession> {
    return { url: "/pricing" };
  }

  verifyWebhook(payload: string, signature: string): WebhookEvent {
    const secret = process.env.BTCPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("BTCPAY_WEBHOOK_SECRET is not configured");
    }

    if (!signature) {
      throw new Error("Missing BTCPay webhook signature");
    }

    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const received = signature.startsWith("sha256=")
      ? signature.slice(7)
      : signature;

    const sigBuffer = Buffer.from(received, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      throw new Error("Invalid BTCPay webhook signature");
    }

    const body = JSON.parse(payload) as BtcpayWebhookPayload;
    const eventType = body.type ?? "";
    const metadata = parseBtcpayMetadata(body.metadata);

    if (!metadata) {
      throw new Error("Invalid BTCPay webhook metadata");
    }

    const isSuccess = SETTLED_EVENTS.has(eventType);
    const isFailed = FAILED_EVENTS.has(eventType);

    if (!isSuccess && !isFailed) {
      return {
        type: "payment.ignored",
        provider: this.name,
        providerEventId: metadata.orderId,
        metadata: { eventType, invoiceId: body.invoiceId },
      };
    }

    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    return {
      type: isSuccess ? "payment.success" : "payment.failed",
      provider: this.name,
      providerEventId: metadata.orderId,
      providerSubscriptionId: `btcpay_${metadata.orderId}`,
      providerCustomerId: metadata.userId,
      providerPaymentId: body.invoiceId ?? metadata.orderId,
      userId: metadata.userId,
      plan: metadata.plan,
      status: isSuccess ? "active" : "canceled",
      currency: "USD",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      metadata: { eventType, invoiceId: body.invoiceId, storeId: body.storeId },
    };
  }

  async cancelSubscription(): Promise<void> {
    // BTCPay one-time invoices have no subscription to cancel
  }
}
