import { NextResponse } from "next/server";
import { handleSubscriptionEvent, verifyWebhook } from "@/lib/payments/payment-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const payload = await request.text();
  const signature =
    request.headers.get("x-nexapay-signature") ??
    request.headers.get("x-signature") ??
    request.headers.get("x-lemonsqueezy-signature") ??
    "";

  try {
    const event = verifyWebhook(provider, payload, signature);
    await handleSubscriptionEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
