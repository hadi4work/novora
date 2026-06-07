import { createHmac, timingSafeEqual } from "crypto";
import { APP_URL } from "@/lib/constants";
import { PLAN_PRICES } from "@/lib/constants";
import {
  encodeNexaPayDescription,
  parseNexaPayDescription,
} from "@/lib/payments/nexapay-description";
import type {
  CheckoutParams,
  CheckoutSession,
  PaymentProvider,
  PortalSession,
  WebhookEvent,
} from "@/lib/payments/types";

interface NexaPayCreateResponse {
  payment_url?: string;
  url?: string;
  checkout_url?: string;
  id?: string;
  transaction_id?: string;
}

interface NexaPayWebhookBody {
  transaction_status?: string;
  status?: string;
  amount?: number;
  description?: string;
  transaction_id?: string;
  id?: string;
}

export class NexaPayProvider implements PaymentProvider {
  name = "nexapay";

  private get apiUrl() {
    const url = process.env.NEXAPAY_API_URL;
    if (!url) {
      throw new Error("NEXAPAY_API_URL is not configured");
    }
    return url;
  }

  private get walletAddress() {
    const address = process.env.NEXAPAY_WALLET_ADDRESS;
    if (!address) {
      throw new Error("NEXAPAY_WALLET_ADDRESS is not configured");
    }
    return address;
  }

  private get network() {
    return process.env.NEXAPAY_NETWORK ?? "TRC20";
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    if (!params.paymentRef) {
      throw new Error("paymentRef is required for NexaPay checkout");
    }

    const amount = PLAN_PRICES[params.plan].monthly;
    const description = encodeNexaPayDescription({
      ref: params.paymentRef,
      userId: params.userId,
      plan: params.plan,
      email: params.email,
    });

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        wallet_address: this.walletAddress,
        network: this.network,
        callback_url: `${APP_URL}/api/webhooks/payments/nexapay`,
        description,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NexaPay API error: ${errorText || response.statusText}`);
    }

    const data = (await response.json()) as NexaPayCreateResponse;
    const paymentUrl =
      data.payment_url ?? data.checkout_url ?? data.url;

    if (!paymentUrl) {
      throw new Error("NexaPay did not return a payment URL");
    }

    return {
      url: paymentUrl,
      sessionId: data.transaction_id ?? data.id ?? params.paymentRef,
    };
  }

  async createPortalSession(): Promise<PortalSession> {
    return { url: "/pricing" };
  }

  verifyWebhook(payload: string, signature: string): WebhookEvent {
    const secret = process.env.NEXAPAY_WEBHOOK_SECRET;

    if (secret && signature) {
      const expected = createHmac("sha256", secret).update(payload).digest("hex");
      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expected);

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        throw new Error("Invalid NexaPay webhook signature");
      }
    } else if (secret && !signature) {
      throw new Error("Missing NexaPay webhook signature");
    }

    const body = JSON.parse(payload) as NexaPayWebhookBody;
    const description = parseNexaPayDescription(body.description);

    if (!description) {
      throw new Error("Invalid NexaPay webhook description");
    }

    const rawStatus = body.transaction_status ?? body.status ?? "";
    const isSuccess = rawStatus === "success" || rawStatus === "succeeded";
    const amountCents = body.amount
      ? Math.round(body.amount * 100)
      : undefined;

    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    return {
      type: isSuccess ? "payment.success" : "payment.failed",
      provider: this.name,
      providerEventId: description.ref,
      providerSubscriptionId: `nexapay_${description.ref}`,
      providerCustomerId: description.userId,
      providerPaymentId: body.transaction_id ?? body.id ?? description.ref,
      userId: description.userId,
      plan: description.plan,
      status: isSuccess ? "active" : "canceled",
      amountCents,
      currency: "USD",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      metadata: { rawStatus, description: body.description },
    };
  }

  async cancelSubscription(): Promise<void> {
    // NexaPay wallet flow has no external subscription to cancel
  }
}
